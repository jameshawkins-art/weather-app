#!/bin/bash
# setup_node.sh - Downloads a portable Node.js environment with robust security verification.

VERSION="v22.12.0"
DISTRO="linux-x64"
DIR="node-$VERSION-$DISTRO"
FILE="$DIR.tar.xz"

echo "========================================="
echo "   Securing Node.js Environment Setup"
echo "========================================="
REQUIRED_TOOLS=("curl" "sha256sum")
OPTIONAL_TOOLS=("gpgv")

MISSING_REQUIRED=()
for tool in "${REQUIRED_TOOLS[@]}"; do
    if ! command -v "$tool" &> /dev/null; then
        MISSING_REQUIRED+=("$tool")
    fi
done

if [ ${#MISSING_REQUIRED[@]} -ne 0 ]; then
    echo "❌ CRITICAL ERROR: Missing core applications required for security: ${MISSING_REQUIRED[*]}" >&2
    echo "   Please install them (e.g., via apt or dnf) before proceeding." >&2
    exit 1
fi

HAS_GPGV=true
for tool in "${OPTIONAL_TOOLS[@]}"; do
    if ! command -v "$tool" &> /dev/null; then
        echo "⚠️  WARNING: Optional security application '$tool' is not installed." >&2
        echo "   -> Skipping Cryptographic Authenticity (PGP) validation." >&2
        echo "   -> The script will fall back to SHA256 Integrity Verification only." >&2
        echo "----------------------------------------"
        HAS_GPGV=false
    fi
done

if [ "$HAS_GPGV" = true ]; then
    echo "✅ All core and cryptographic validation utilities detected."
    echo "----------------------------------------"
fi

echo "- Downloading Node.js $VERSION archive..."
curl -sSLO "https://nodejs.org/dist/$VERSION/$FILE"

if [ "$HAS_GPGV" = true ]; then
    echo "- Downloading PGP-signed checksum manifest..."
    curl -sSLO "https://nodejs.org/dist/$VERSION/SHASUMS256.txt.asc"
    
    echo "- Fetching official Node.js Release Team GPG keyring..."
    curl -fsLo "nodejs-keyring.kbx" "https://github.com/nodejs/release-keys/raw/HEAD/gpg/pubring.kbx"
    
    echo "- Verifying PGP signature and extracting security manifest..."
    # Extracts verified text out of the signed armor directly to prevent substitution attacks
    if gpgv --keyring="./nodejs-keyring.kbx" --output SHASUMS256.txt < SHASUMS256.txt.asc >/dev/null 2>&1; then
        echo "✅ Cryptographic signature valid! The manifest is untampered and authentic."
    else
        echo "❌ CRITICAL SECURITY ERROR: GPG signature verification FAILED!" >&2
        echo "   The signature file is invalid, forged, or compromised." >&2
        echo "   Aborting installation immediately to protect system integrity." >&2
        rm -f "$FILE" SHASUMS256.txt.asc nodejs-keyring.kbx SHASUMS256.txt
        exit 1
    fi
    # Safely discard GPG-specific temporary artifacts
    rm -f SHASUMS256.txt.asc nodejs-keyring.kbx
else
    # Fallback protocol if gpgv is unavailable
    echo "- Downloading plain checksum manifest (unverified authenticity)..."
    curl -sSLO "https://nodejs.org/dist/$VERSION/SHASUMS256.txt"
fi

echo "- Matching archive signature against SHA256 hash..."
if grep "$FILE" SHASUMS256.txt | sha256sum -c - >/dev/null 2>&1; then
    echo "✅ SHA256 checksum matches! The archive is structurally intact."
else
    echo "❌ CRITICAL SECURITY ERROR: SHA256 checksum mismatch!" >&2
    echo "   The downloaded archive is corrupt or has been altered post-release." >&2
    echo "   Aborting installation immediately." >&2
    rm -f "$FILE" SHASUMS256.txt
    exit 1
fi

rm -f SHASUMS256.txt

echo "----------------------------------------"
echo "- Extracting secure copy of Node.js $VERSION..."
tar -xJf "$FILE"
rm "$FILE"

mkdir -p bin
ln -sf "../$DIR/bin/node" bin/node
ln -sf "../$DIR/bin/npm" bin/npm
ln -sf "../$DIR/bin/npx" bin/npx

echo "- Node.js $VERSION successfully verified and installed locally."
echo "You can now run commands using './bin/node' or './bin/npm'."
echo "To add to your current session path, run: export PATH=\$PWD/bin:\$PATH"
echo "----------------------------------------"

export PATH="$PWD/bin:$PATH"
echo -n "Verified Node Version: " && node -v
echo -n "Verified NPM Version:  " && npm -v