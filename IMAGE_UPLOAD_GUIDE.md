# Image Upload System with Cloudinary

This guide explains how to use the Cloudinary image upload system implemented in your marketplace app.

## Setup Requirements

### 1. Environment Variables

Make sure you have these environment variables set in your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Cloudinary Account

- Sign up at [Cloudinary](https://cloudinary.com/)
- Get your cloud name, API key, and API secret from your dashboard
- These will be used in the environment variables above

## How It Works

### Backend Implementation

#### 1. Cloudinary Service (`backend/src/services/cloudinary.service.js`)

- **`uploadToCloudinary(filePath, folder)`**: Uploads a file from disk
- **`uploadBufferToCloudinary(buffer, originalname, folder)`**: Uploads from memory buffer (used with multer)
- **`uploadMultipleToCloudinary(files, folder)`**: Uploads multiple files
- **`deleteFromCloudinary(publicId)`**: Deletes a file from Cloudinary
- **`deleteMultipleFromCloudinary(publicIds)`**: Deletes multiple files

#### 2. Product Service (`backend/src/modules/products/product.service.js`)

- **`processProductData(body, files)`**: Processes FormData and uploads images
- Automatically uploads images for each color variant
- Stores Cloudinary URLs in the product database

#### 3. Product Router (`backend/src/modules/products/product.router.js`)

- Uses multer with memory storage for better Cloudinary integration
- Supports multiple file uploads (up to 25 files, 5MB each)
- File type validation (images only)

### Frontend Implementation

#### 1. FormData Structure

When sending product data with images, use this structure:

```javascript
const formData = new FormData();

// Basic product info
formData.append('name', productName);
formData.append('price', price);
formData.append('description', description);
formData.append('category', category);
formData.append('hasSizes', String(hasSizes));

// For each color variant
colors.forEach((color, colorIndex) => {
  formData.append(`colors[${colorIndex}][colorCode]`, color.colorCode);
  formData.append(`colors[${colorIndex}][colorName]`, color.colorName);

  // Images for this color
  color.images.forEach((file, imageIndex) => {
    formData.append(`colors[${colorIndex}][images][${imageIndex}]`, file);
  });

  // Size quantities (if applicable)
  if (hasSizes) {
    color.sizes.forEach((size, sizeIndex) => {
      formData.append(
        `colors[${colorIndex}][sizes][${sizeIndex}][size]`,
        size.size
      );
      formData.append(
        `colors[${colorIndex}][sizes][${sizeIndex}][quantity]`,
        String(size.quantity)
      );
    });
  } else {
    formData.append(`colors[${colorIndex}][quantity]`, String(color.quantity));
  }
});
```

#### 2. API Endpoints

**Create Product with Images:**

```javascript
POST /api/products
Content-Type: multipart/form-data
Authorization: Bearer <token>

// Send FormData with product info and images
```

**Update Product with Images:**

```javascript
PUT /api/products/:id
Content-Type: multipart/form-data
Authorization: Bearer <token>

// Send FormData with updated product info and images
```

**Test Image Upload:**

```javascript
POST /api/products/upload-image
Content-Type: multipart/form-data

// Send single image for testing
```

## Usage Examples

### 1. Testing Image Upload

Visit `/test-upload` in your frontend to test single image uploads.

### 2. Creating a Product with Images

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();

  // Add product data
  formData.append('name', 'Test Product');
  formData.append('price', '29.99');
  formData.append('description', 'A test product');
  formData.append('category', 'Fashion');
  formData.append('hasSizes', 'false');

  // Add color with images
  formData.append('colors[0][colorCode]', '#ff0000');
  formData.append('colors[0][colorName]', 'Red');
  formData.append('colors[0][quantity]', '10');

  // Add images for the color
  selectedFiles.forEach((file, index) => {
    formData.append(`colors[0][images][${index}]`, file);
  });

  try {
    const response = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    console.log('Product created:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 3. Displaying Images

Images are stored as URLs in the database. You can display them directly:

```jsx
{
  product.colors.map((color, colorIndex) => (
    <div key={colorIndex}>
      <h3>{color.colorName}</h3>
      <div className="image-gallery">
        {color.images.map((imageUrl, imageIndex) => (
          <img
            key={imageIndex}
            src={imageUrl}
            alt={`${color.colorName} - Image ${imageIndex + 1}`}
            className="product-image"
          />
        ))}
      </div>
    </div>
  ));
}
```

## File Limits and Validation

- **File Size**: Maximum 5MB per image
- **File Type**: Images only (JPEG, PNG, GIF, WebP, etc.)
- **Total Files**: Maximum 25 files per request
- **Images per Color**: Up to 5 images per color variant

## Error Handling

The system includes comprehensive error handling:

1. **File Validation**: Checks file type and size
2. **Upload Errors**: Handles Cloudinary upload failures
3. **Network Errors**: Handles connection issues
4. **Authentication**: Validates user permissions

## Security Features

1. **File Type Validation**: Only allows image files
2. **Size Limits**: Prevents large file uploads
3. **Authentication**: Requires valid JWT token
4. **User Permissions**: Only sellers can upload product images
5. **Secure URLs**: Uses HTTPS URLs from Cloudinary

## Troubleshooting

### Common Issues

1. **"Only image files are allowed"**

   - Make sure you're uploading image files (JPEG, PNG, etc.)
   - Check file extension and MIME type

2. **"File too large"**

   - Reduce image size (max 5MB)
   - Compress images before upload

3. **"Upload failed"**

   - Check Cloudinary credentials in environment variables
   - Verify internet connection
   - Check Cloudinary account status

4. **"Unauthorized"**
   - Ensure you're logged in as a seller
   - Check JWT token validity

### Debugging

1. **Check Network Tab**: Look for failed requests
2. **Check Console**: Look for error messages
3. **Test Single Upload**: Use `/test-upload` page
4. **Check Environment Variables**: Verify Cloudinary credentials

## Performance Optimization

1. **Image Compression**: Cloudinary automatically optimizes images
2. **Lazy Loading**: Implement lazy loading for product images
3. **CDN**: Cloudinary provides global CDN for fast loading
4. **Responsive Images**: Cloudinary can serve different sizes automatically

## Next Steps

1. **Image Optimization**: Implement responsive images
2. **Image Cropping**: Add image editing capabilities
3. **Bulk Upload**: Implement drag-and-drop multiple file upload
4. **Image Gallery**: Create a better image gallery component
5. **Image Deletion**: Add ability to delete individual images
