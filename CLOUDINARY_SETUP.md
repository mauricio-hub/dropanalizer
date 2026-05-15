# Cloudinary Setup for Proply

## Current Status
The Proply dropshipping MVP is fully implemented and ready for testing. Image uploads are configured but require one final step in Cloudinary.

## What's Done
✅ Environment variables configured in `.env.local`
✅ Cloudinary API credentials added
✅ Upload code implemented (client-side direct upload)
✅ TypeScript compilation successful
✅ Dev server running

## What's Needed: Create Unsigned Upload Preset

### Step 1: Go to Cloudinary Dashboard
Visit: https://cloudinary.com/console/settings/upload

### Step 2: Create New Unsigned Preset
1. Click "Add upload preset" button
2. **Name**: `proply_unsigned`
3. **Type**: Select "Unsigned"
4. **Signing Mode**: Leave as is
5. Save

### Step 3: Verify
The upload preset should now be available at:
```
https://api.cloudinary.com/v1_1/landing-generator/image/upload
```

With preset: `proply_unsigned`

## Environment Variables (Already Set)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=landing-generator
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=proply_unsigned
```

## Testing Image Upload
1. Navigate to `http://localhost:3000/proposals/new` (or 3001 if 3000 is busy)
2. Select template: "Producto Nuevo" or "Oferta Limitada"
3. Enter product name and price
4. Try uploading 3-5 images
5. If successful, you'll see thumbnails
6. Click "Generar Landing" to create the landing page

## Troubleshooting

**"Error al subir imagen"**
- Verify the unsigned preset `proply_unsigned` exists in Cloudinary
- Check that `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` is set to `proply_unsigned` in `.env.local`
- Restart dev server after changing env variables

**Images not appearing**
- Ensure images are JPG, PNG, or WebP format
- Check file size is under 5MB
- Verify Cloudinary account is active

## Security Note
The unsigned preset means image uploads don't require server-side signing. This is safe for the MVP because:
1. Only authenticated Proply users can access the upload page
2. Uploads go directly to your Cloudinary account
3. The preset is specific to this project only

For production, consider adding:
- API signature verification
- File type/size validation on server
- Rate limiting per user
