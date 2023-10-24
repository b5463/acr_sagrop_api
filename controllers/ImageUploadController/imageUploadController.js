/**
 * @file imageUploadController.js
 * @description This file contains the image upload algorithm for the Sagrop application.
 *              The algorithm uses the 'multer' library to handle image uploads and stores
 *              the images in the local file system in a designated directory.
 *
 * @version 1.0
 * @license Copyright © 2023 Acronym Web Design.
 *           All rights reserved. Unauthorized copying or reproduction of this file
 *           or its contents is prohibited. This file is proprietary and confidential.
 *           It may not be disclosed, copied, reproduced, or used without express
 *           written permission from Acronym Web Design.
 * @author Acronym Web Design | AjM
 */

const path = require('path');
const multer = require('multer');
const { logData } = require('../../logging/logger');

/**
 * Handles image uploads and stores them in a designated directory.
 */
class ImageUploadController {
  constructor() {
    // Configure storage for multer
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        // Define the destination directory for uploaded images
        cb(null, path.join(__dirname, '../../public/uploads'));
      },
      filename: (req, file, cb) => {
        // Generate a sanitized filename with a timestamp
        const originalname = file.originalname;
        const sanitizedFilename = `${Date.now()}-${encodeURIComponent(originalname)}`;
        cb(null, sanitizedFilename);
      },
    });

    // Create a multer instance with the defined storage
    this.upload = multer({ storage: this.storage });
  }

  /**
   * Logs an error message with details.
   * @private
   * @param {string} message - The error message.
   * @param {Error} error - The error object.
   * @param {string} functionOrigin - The function where the error occurred.
   */
  _logError(message, error, functionOrigin) {
    const fileName = 'imageUploadController.js';
    logData(fileName, `[${functionOrigin}] ${message}: ${error.message}`, 'error');
  }

  /**
   * Logs an information message.
   * @private
   * @param {string} message - The information message.
   * @param {string} functionOrigin - The function where the information originated.
   */
  _logInfo(message, functionOrigin) {
    const fileName = 'imageUploadController.js';
    logData(fileName, `[${functionOrigin}] ${message}`, 'info');
  }

  /**
   * Middleware to handle image upload errors.
   *
   * @param {Error} err - The error object.
   * @param {express.Request} req - The request object from Express.
   * @param {express.Response} res - The response object from Express.
   * @param {Function} next - The next middleware function.
   */
  handleUploadError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
      // Handle Multer-related errors
      this._logError('Multer Error', err, 'handleUploadError');
      return res.status(400).json({ message: 'Image upload error' });
    } else if (err) {
      // Handle other upload errors
      this._logError('Error uploading image', err, 'handleUploadError');
      return res.status(500).json({ message: 'Error uploading image' });
    }
    next();
  }

  /**
   * Handles image uploads for the Sagrop application.
   *
   * @param {express.Request} req - The request object from Express.
   * @param {express.Response} res - The response object from Express.
   */
  handleImageUpload(req, res) {
    this.upload.single('image')(req, res, (err) => {
      if (err) {
        // Handle image upload errors
        this._logError('Error uploading image', err, 'handleImageUpload');
        return res.status(500).json({ message: 'Error uploading image' });
      }

      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${encodeURIComponent(req.file.filename)}`;
      this._logInfo(`Image uploaded: ${imageUrl}`, 'handleImageUpload');
      return res.status(200).json({ imageUrl });
    });
  }
}

// Create an instance of ImageUploadController
const imageUploadController = new ImageUploadController();

// Export the methods with the instance bound to maintain context
module.exports = {
  /**
   * Handles image uploads for the Sagrop application.
   *
   * @param {express.Request} req - The request object from Express.
   * @param {express.Response} res - The response object from Express.
   */
  handleImageUpload: imageUploadController.handleImageUpload.bind(imageUploadController),

  /**
   * Middleware to handle image upload errors.
   *
   * @param {Error} err - The error object.
   * @param {express.Request} req - The request object from Express.
   * @param {express.Response} res - The response object from Express.
   * @param {Function} next - The next middleware function.
   */
  handleUploadError: imageUploadController.handleUploadError.bind(imageUploadController),
};