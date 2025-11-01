/**
 * Storage Service
 * Handles file uploads and downloads to/from Supabase Storage
 */

import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'expense-attachments'

/**
 * Upload a file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} folderPath - Optional folder path (e.g., 'expense-requests/uuid')
 * @returns {Promise<{url: string, path: string}>} - Public URL and storage path
 */
async function uploadFile(file, folderPath = '') {
  try {
    // Generate unique filename to avoid collisions
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExt}`

    // Construct full path
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading file:', error)
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return {
      url: publicUrl,
      path: data.path
    }
  } catch (error) {
    console.error('Storage service upload error:', error)
    throw error
  }
}

/**
 * Upload multiple files
 * @param {File[]} files - Array of files to upload
 * @param {string} folderPath - Optional folder path
 * @returns {Promise<Array<{name: string, url: string, path: string, size: number, type: string}>>}
 */
async function uploadFiles(files, folderPath = '') {
  try {
    const uploadPromises = files.map(async (file) => {
      const { url, path } = await uploadFile(file, folderPath)
      return {
        name: file.name,
        url,
        path,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      }
    })

    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error('Storage service upload multiple error:', error)
    throw error
  }
}

/**
 * Delete a file from Supabase Storage
 * @param {string} filePath - The path of the file to delete
 * @returns {Promise<void>}
 */
async function deleteFile(filePath) {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  } catch (error) {
    console.error('Storage service delete error:', error)
    throw error
  }
}

/**
 * Delete multiple files
 * @param {string[]} filePaths - Array of file paths to delete
 * @returns {Promise<void>}
 */
async function deleteFiles(filePaths) {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths)

    if (error) {
      console.error('Error deleting files:', error)
      throw error
    }
  } catch (error) {
    console.error('Storage service delete multiple error:', error)
    throw error
  }
}

/**
 * Get download URL for a file
 * @param {string} filePath - The path of the file
 * @returns {Promise<string>} - Signed URL for download
 */
async function getDownloadUrl(filePath) {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600) // 1 hour expiry

    if (error) {
      console.error('Error getting download URL:', error)
      throw error
    }

    return data.signedUrl
  } catch (error) {
    console.error('Storage service get URL error:', error)
    throw error
  }
}

/**
 * Download a file
 * @param {string} filePath - The path of the file to download
 * @returns {Promise<Blob>} - File blob
 */
async function downloadFile(filePath) {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath)

    if (error) {
      console.error('Error downloading file:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Storage service download error:', error)
    throw error
  }
}

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - {valid: boolean, error: string}
 */
function validateFile(file, options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ]
  } = options

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `El archivo ${file.name} excede el tamaño máximo de ${maxSize / 1024 / 1024}MB`
    }
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `El tipo de archivo ${file.type} no está permitido`
    }
  }

  return { valid: true, error: null }
}

/**
 * Validate multiple files
 * @param {File[]} files - Files to validate
 * @param {Object} options - Validation options
 * @returns {Object} - {valid: boolean, errors: string[]}
 */
function validateFiles(files, options = {}) {
  const errors = []

  for (const file of files) {
    const { valid, error } = validateFile(file, options)
    if (!valid) {
      errors.push(error)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size (e.g., "1.5 MB")
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export const storageService = {
  uploadFile,
  uploadFiles,
  deleteFile,
  deleteFiles,
  getDownloadUrl,
  downloadFile,
  validateFile,
  validateFiles,
  formatFileSize
}
