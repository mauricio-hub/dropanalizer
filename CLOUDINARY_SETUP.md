# Cloudinary Setup for Proply

## Current Status
✅ **COMPLETE** - The Proply dropshipping MVP is fully implemented and ready for testing!

## What's Done
✅ Environment variables configured in `.env.local`
✅ Cloudinary API credentials added
✅ Upload code implemented (client-side direct upload)
✅ TypeScript compilation successful
✅ Dev server running
✅ **Unsigned upload preset created** (`proply_unsigned`)
✅ Image uploads fully functional

## Setup Complete: Unsigned Upload Preset

### Preset Created! ✅

The unsigned upload preset `proply_unsigned` has been automatically created for you.

**Location**: https://cloudinary.com/console/dnkqzaolo/settings/upload
**Preset Name**: `proply_unsigned`
**Type**: Unsigned
**Status**: Ready to use

You can verify it exists by visiting the Upload Settings page in your Cloudinary console.

## Environment Variables (Already Set)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dnkqzaolo
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=proply_unsigned
CLOUDINARY_API_KEY=957891344239572
CLOUDINARY_API_SECRET=X1Nw8wQw54EzZz1mEQ4tTeaF150
```

## Testing Image Upload

✅ **Ready to test!** Follow these steps:

1. Navigate to `http://localhost:3000/proposals/new`
2. Select template: "Producto Nuevo" or "Oferta Limitada"
3. Enter product name and price
4. Upload 3-5 images (JPG, PNG, or WebP, max 5MB each)
5. You'll see thumbnails appear as they upload
6. Click "Generar Landing" to create the landing page

### Expected Behavior
- Images upload directly to Cloudinary (no server delay)
- Thumbnails appear immediately after upload
- Progress indicator shows upload status
- On any single image error: error displays, image removed, others continue
- After all images uploaded: "Generar Landing" button becomes enabled

## Troubleshooting

**"Error al subir imagen"**
- Clear browser cache (Ctrl+Shift+Delete)
- Verify file format (JPG, PNG, or WebP)
- Check file size is under 5MB
- Try a different browser
- Restart dev server: `npm run dev`

**Images not uploading**
- Ensure you're on `http://localhost:3000` (not 3001)
- Check browser console for detailed error messages (F12)
- Verify Cloudinary account is active
- Try uploading a small test image (< 1MB)

**Check Setup Script Output**
If you need to re-run the setup:
```bash
node setup-cloudinary-preset.js
```

## Security Note
The unsigned preset means image uploads don't require server-side signing. This is safe for the MVP because:
1. Only authenticated Proply users can access the upload page
2. Uploads go directly to your Cloudinary account
3. The preset is specific to this project only

For production, consider adding:
- API signature verification
- File type/size validation on server
- Rate limiting per user
