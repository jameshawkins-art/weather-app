#!/bin/bash
set -e

# Ensure script is run with sudo/root privileges
if [ "$(id -u)" -ne 0 ]; then
    echo "Error: This script must be run as root (or use sudo)."
    exit 1
fi

if [ -z "$PROXY_DOMAIN" ]; then
    echo "Error: PROXY_DOMAIN environment variable is required."
    exit 1
fi

DOMAIN="$PROXY_DOMAIN"
CONF_FILE="/etc/nginx/sites-available/$DOMAIN"
ENABLED_LINK="/etc/nginx/sites-enabled/$DOMAIN"

# 1. Install Nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "[INFO] Nginx not found. Installing..."
    apt-get update
    apt-get install -y nginx
else
    echo "[INFO] Nginx is already installed."
fi

# 2. Write the Nginx config to a temporary file
TEMP_CONF=$(mktemp)

# Define rate limit zone
cat <<EOF > "$TEMP_CONF"
limit_req_zone \$binary_remote_addr zone=weatherlimit:10m rate=10r/s;

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $DOMAIN;
    
    # Allow Let's Encrypt validation through HTTP
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location ~* \.(php|env|bak|config|sql)$ {
        return 444;
    }

    location ~* /(wp-admin|administrator|phpunit|phpinfo|cgi-bin|luci|sys_stat) {
        return 444;
    }

    location / {
EOF

if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    cat <<EOF >> "$TEMP_CONF"
        return 301 https://\$host\$request_uri;
    }
}

# Main HTTPS Server Block
server {
    listen 443 ssl;
    server_name $DOMAIN;

    # SSL Certificate Paths
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Best Practice SSL Settings
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 2M;

    # Block access to hidden files
    location ~ /\.(?!well-known) {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Catch vulnerable frameworks/files
    location ~* \.(php|env|bak|config|sql|log|swp)$ {
        return 444;
    }

    # Backend Application Proxy
    location / {
        if (\$request_method !~ ^(GET|OPTIONS|HEAD)$ ) {
            return 445;
        }

        limit_req zone=weatherlimit burst=20 nodelay;
        proxy_pass http://localhost:8083;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
else
    cat <<EOF >> "$TEMP_CONF"
        # Temporary proxy for bootstrap before SSL is active
        limit_req zone=weatherlimit burst=20 nodelay;
        proxy_pass http://localhost:8083;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
fi

# Ensure we clean up the temporary file on exit
trap 'rm -f "$TEMP_CONF"' EXIT

# Helper function to create/refresh symlinks and default config removal
setup_links() {
    echo "[INFO] Enabling the site configuration..."
    mkdir -p /etc/nginx/sites-available
    mkdir -p /etc/nginx/sites-enabled

    if [ -L "$ENABLED_LINK" ]; then
        rm "$ENABLED_LINK"
    elif [ -f "$ENABLED_LINK" ]; then
        rm "$ENABLED_LINK"
    fi
    ln -s "$CONF_FILE" "$ENABLED_LINK"

    if [ -L "/etc/nginx/sites-enabled/default" ] || [ -f "/etc/nginx/sites-enabled/default" ]; then
        echo "[INFO] Removing default Nginx site configuration..."
        rm -f /etc/nginx/sites-enabled/default
    fi
}

if [ -f "$CONF_FILE" ]; then
    # Compare current configuration with the new one
    if ! cmp -s "$TEMP_CONF" "$CONF_FILE"; then
        echo "[INFO] Nginx configuration changes detected. Overwriting..."
        BACKUP_CONF=$(mktemp)
        cp "$CONF_FILE" "$BACKUP_CONF"
        cp "$TEMP_CONF" "$CONF_FILE"
        setup_links
        
        echo "[INFO] Verifying Nginx syntax with new configuration..."
        if nginx -t; then
            echo "[INFO] Syntax OK. Reloading Nginx..."
            systemctl reload nginx
            rm -f "$BACKUP_CONF"
        else
            echo "[ERROR] Nginx configuration syntax test failed. Reverting to backup..."
            cp "$BACKUP_CONF" "$CONF_FILE"
            setup_links
            rm -f "$BACKUP_CONF"
            exit 1
        fi
    else
        echo "[INFO] Nginx configuration is already up to date."
        setup_links
    fi
else
    echo "[INFO] Nginx configuration for $DOMAIN does not exist. Creating..."
    cp "$TEMP_CONF" "$CONF_FILE"
    setup_links
    
    echo "[INFO] Verifying Nginx syntax..."
    if nginx -t; then
        echo "[INFO] Syntax OK. Reloading Nginx..."
        systemctl reload nginx
    else
        echo "[ERROR] Nginx configuration syntax test failed. Removing configuration."
        rm -f "$CONF_FILE"
        exit 1
    fi
fi
