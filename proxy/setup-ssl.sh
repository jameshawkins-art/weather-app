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
if [ -z "$SSL_EMAIL" ]; then
    echo "Error: SSL_EMAIL environment variable is required."
    exit 1
fi

API_DOMAIN="$PROXY_DOMAIN"
EMAIL="$SSL_EMAIL"

if ! command -v certbot &> /dev/null; then
    echo "[INFO] Updating system package list..."
    apt-get update || true

    echo "[INFO] Installing Certbot and the Nginx plugin..."
    apt-get install -y certbot python3-certbot-nginx
else
    echo "[INFO] Certbot is already installed."
fi

if [ -d "/etc/letsencrypt/live/$API_DOMAIN" ]; then
    echo "[INFO] SSL certificate for '$API_DOMAIN' already exists. Skipping provisioning."
else
    echo "[INFO] Provisioning SSL certificates for '$API_DOMAIN'..."
    certbot --nginx \
        -d "$API_DOMAIN" \
        --non-interactive \
        --agree-tos \
        -m "$EMAIL" \
        --redirect
fi

echo "[INFO] Verifying auto-renewal mechanics..."
if systemctl list-timers | grep -q certbot.timer; then
    echo "[PASS] Native systemd certbot.timer is active for background auto-renewal."
    systemctl status certbot.timer --no-pager
else
    echo "[WARN] Systemd certbot.timer not found. Checking for fallback cron jobs..."
    if ls /etc/cron.d/certbot >/dev/null 2>&1; then
       echo "[PASS] Legacy cron job found in /etc/cron.d/certbot for background auto-renewal."
    else
       echo "[FAIL] Could not verify an active certbot auto-renewal configuration!"
       echo "       Please manually verify your system's scheduling."
    fi
fi

echo "[INFO] Running a simulated auto-renewal test (dry-run)..."
certbot renew --cert-name "$API_DOMAIN" --dry-run || true

echo "[INFO] SSL fully provisioned!"
