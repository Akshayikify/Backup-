# QR Code Global Access Setup Guide

## Current Implementation

The QR code now generates a globally accessible URL that anyone can scan and use to verify documents.

## Configuration

### For Development (Local Testing)

1. **Option 1: Use ngrok** (Recommended for testing)
   ```bash
   # Install ngrok: https://ngrok.com/download
   ngrok http 3000
   # Copy the public URL (e.g., https://abc123.ngrok.io)
   ```

2. **Create `.env` file** in `pixelgenesis/`:
   ```env
   REACT_APP_PUBLIC_URL=https://abc123.ngrok.io
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

3. **Restart your React app**:
   ```bash
   npm start
   ```

### For Production

1. **Set environment variables** in your hosting platform:
   - Vercel: Add in Project Settings → Environment Variables
   - Netlify: Add in Site Settings → Environment Variables
   - Heroku: `heroku config:set REACT_APP_PUBLIC_URL=https://yourdomain.com`

2. **Example `.env.production`**:
   ```env
   REACT_APP_PUBLIC_URL=https://pixelgenesis.com
   REACT_APP_BACKEND_URL=https://api.pixelgenesis.com
   ```

## How It Works

1. **QR Code Generation**:
   - Uses `REACT_APP_PUBLIC_URL` if set
   - Falls back to `window.location.origin` if not set
   - Format: `{PUBLIC_URL}/verify?cid={CID}&tx={TX_HASH}`

2. **Global Access**:
   - QR code contains public URL
   - Anyone can scan and access
   - No authentication required for verification
   - Works on any device with internet

3. **Verification Page**:
   - Publicly accessible (no login required)
   - Auto-fills form from URL parameters
   - Works with both `cid` and `hash` parameters

## Testing

1. **Generate QR Code**:
   - Upload a document
   - Click "Share" button
   - QR code will be displayed

2. **Test Globally**:
   - Scan QR code with any phone
   - Should open verification page
   - Form should be pre-filled
   - Can verify without login

## Troubleshooting

### QR Code shows localhost URL
- **Solution**: Set `REACT_APP_PUBLIC_URL` in `.env` file
- Restart React development server

### QR Code doesn't open on mobile
- **Solution**: Ensure `REACT_APP_PUBLIC_URL` is set to a publicly accessible URL
- Use ngrok for local testing
- Deploy to production for real global access

### Verification page requires login
- **Solution**: Already fixed - verification page is public
- No wallet connection required for verification

## Best Practices

1. **Always set `REACT_APP_PUBLIC_URL`** in production
2. **Use HTTPS** for production URLs
3. **Test QR codes** on multiple devices
4. **Keep URLs short** (QR codes work better with shorter URLs)
5. **Use CID instead of full hash** when possible

## Example QR Code URL Format

```
https://pixelgenesis.com/verify?cid=QmXyZ123...&tx=0xabc...
```

This URL is:
- ✅ Globally accessible
- ✅ Works on any device
- ✅ No authentication required
- ✅ Auto-fills verification form
- ✅ Can be shared via QR code, link, or text

