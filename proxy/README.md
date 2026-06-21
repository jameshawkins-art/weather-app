# Standalone Weather Proxy Server (Go Backend)

This is a standalone Go proxy backend for the Weather Application. It is designed to run on a Linux VPS (such as Ubuntu Server) to bypass browser Mixed Content restrictions by proxying requests to the HTTP-only WeatherStack API server-to-server.

## Directory Structure

*   `main.go`: Main Go server source code.
*   `weather-proxy.service`: Systemd service unit configuration file.
*   `setup-nginx.sh`: Bash script to install Nginx, write configuration, and reload Nginx.
*   `setup-ssl.sh`: Bash script to install Certbot, request a Let's Encrypt SSL certificate, and verify auto-renewal.

---

## Configuration

The proxy requires the following environment variables to run:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `WEATHERSTACK_API_KEY` | Your WeatherStack API token (or `VITE_WEATHERSTACK_API_KEY` as fallback) | Required |
| `PORT` | Local port the Go backend listens on | `8083` |

---

## Deployment & Setup

The easiest way to deploy this backend is via the automated GitHub Actions pipeline.

### GitHub Actions Secrets

Add the following repository secrets to your GitHub repository under **Settings > Secrets and variables > Actions**:

*   `HOST`: The IP address or hostname of your VPS.
*   `USERNAME`: The SSH user to log in to the VPS (e.g., `root` or a user with passwordless `sudo` privileges).
*   `SSH_KEY`: Your private SSH key matching the public key on the VPS.
*   `SSH_PORT`: The SSH port of your VPS (defaults to `22` if not specified).
*   `WEATHERSTACK_API_KEY`: Your WeatherStack API Access Key.
*   `PROXY_DOMAIN`: The domain/subdomain pointed to your VPS IP address (e.g., `weather-api.yourdomain.com`).
*   `SSL_EMAIL`: The email address to register with Let's Encrypt for certificate expiry notices.

When you push code to the `main` branch, the `Deploy Go Backend` workflow will automatically:
1. Compile the Go binary for `linux/amd64`.
2. Transfer the executable, service file, and setup scripts to the VPS `/tmp` directory.
3. Establish an SSH connection, set up directories, and register the systemd service.
4. Execute `setup-nginx.sh` and `setup-ssl.sh` to configure Nginx and Let's Encrypt SSL automatically.

---

## Manual VPS Administration

If you wish to manage the service manually on your Ubuntu Server VPS:

### Systemd Service Management

The systemd configuration is stored in `/etc/systemd/system/weather-proxy.service`. Environment variables are loaded from `/etc/weather-proxy/.env`.

```bash
# Reload configurations
sudo systemctl daemon-reload

# Start the proxy service
sudo systemctl start weather-proxy.service

# Enable the service to run on boot
sudo systemctl enable weather-proxy.service

# Check service status
sudo systemctl status weather-proxy.service

# View application logs
sudo journalctl -u weather-proxy.service -f
```

### Nginx Logs

Verify proxy logs and traffic details:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```
