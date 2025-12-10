import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbHelpers } from '../database.js';

const router = express.Router();

// Get KYC application by user ID
router.get('/application/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const application = await dbHelpers.get(
      `SELECT * FROM kyc_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    // Get documents
    const documents = await dbHelpers.all(
      'SELECT * FROM documents WHERE application_id = ?',
      [application.application_id]
    );

    // Get photos
    const photos = await dbHelpers.all(
      'SELECT * FROM photos WHERE application_id = ?',
      [application.application_id]
    );

    // Format response
    const photoData = photos.find(p => p.photo_type === 'photo') || null;
    const selfieData = photos.find(p => p.photo_type === 'selfie') || null;

    res.json({
      success: true,
      application: {
        applicationId: application.application_id,
        userId: application.user_id,
        status: application.status,
        currentStep: application.current_step,
        personalDetails: {
          fullName: application.full_name,
          dateOfBirth: application.date_of_birth,
          mobile: null, // Will be filled from user data
          email: null, // Will be filled from user data
          address: application.address,
          gender: application.gender
        },
        documents: documents.map(doc => ({
          type: doc.document_type,
          filePath: doc.file_path,
          fileName: doc.file_name,
          status: doc.status,
          attempts: doc.attempts
        })),
        photo: photoData ? {
          filePath: photoData.file_path,
          fileName: photoData.file_name,
          status: photoData.status,
          attempts: photoData.attempts
        } : null,
        selfie: selfieData ? {
          filePath: selfieData.file_path,
          fileName: selfieData.file_name,
          status: selfieData.status,
          attempts: selfieData.attempts,
          faceMatchScore: selfieData.face_match_score
        } : null,
        rejectionReason: application.rejection_reason,
        createdAt: application.created_at,
        updatedAt: application.updated_at
      }
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ success: false, error: 'Failed to get application' });
  }
});

// Update personal details
router.put('/application/:userId/personal-details', async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, dateOfBirth, address, gender } = req.body;

    // Get application
    const application = await dbHelpers.get(
      'SELECT application_id FROM kyc_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    // Update application
    await dbHelpers.run(
      `UPDATE kyc_applications 
       SET full_name = ?, date_of_birth = ?, address = ?, gender = ?, updated_at = datetime('now','localtime') 
       WHERE application_id = ?`,
      [fullName, dateOfBirth, address, gender, application.application_id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update personal details error:', error);
    res.status(500).json({ success: false, error: 'Failed to update personal details' });
  }
});

// Update current step
router.put('/application/:userId/step', async (req, res) => {
  try {
    const { userId } = req.params;
    const { step } = req.body;

    await dbHelpers.run(
      `UPDATE kyc_applications 
       SET current_step = ?, updated_at = datetime('now','localtime') 
       WHERE user_id = ?`,
      [step, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update step error:', error);
    res.status(500).json({ success: false, error: 'Failed to update step' });
  }
});

// Submit for verification
router.post('/application/:userId/submit', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get application
    const application = await dbHelpers.get(
      'SELECT * FROM kyc_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    // Get documents and photos
    const documents = await dbHelpers.all(
      'SELECT * FROM documents WHERE application_id = ? AND status = ?',
      [application.application_id, 'uploaded']
    );

    const photos = await dbHelpers.all(
      'SELECT * FROM photos WHERE application_id = ? AND status = ?',
      [application.application_id, 'uploaded']
    );

    // Validation checks
    const hasAadhaar = documents.some(d => d.document_type === 'aadhaar');
    const hasPan = documents.some(d => d.document_type === 'pan');
    const hasPhoto = photos.some(p => p.photo_type === 'photo');
    const hasSelfie = photos.some(p => p.photo_type === 'selfie');

    if (!hasAadhaar || !hasPan) {
      await dbHelpers.run(
        `UPDATE kyc_applications 
         SET status = ?, rejection_reason = ?, updated_at = datetime('now','localtime') 
         WHERE application_id = ?`,
        ['rejected', 'Aadhaar and PAN are mandatory documents', application.application_id]
      );
      return res.json({ success: false, status: 'rejected', reason: 'Aadhaar and PAN are mandatory documents' });
    }

    // Allow either passport photo or live selfie (at least one required)
    if (!hasPhoto && !hasSelfie) {
      await dbHelpers.run(
        `UPDATE kyc_applications 
         SET status = ?, rejection_reason = ?, updated_at = datetime('now','localtime') 
         WHERE application_id = ?`,
        ['rejected', 'Upload a passport photo or a live selfie', application.application_id]
      );
      return res.json({ success: false, status: 'rejected', reason: 'Upload a passport photo or a live selfie' });
    }

    // Simulate verification process (15-20 seconds)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 15000));

    // Simulate face match only if both photo and selfie are present
    let faceMatchScore = null;
    if (hasPhoto && hasSelfie) {
      faceMatchScore = Math.random() * 40 + 60;
      const faceMatchPassed = faceMatchScore >= 70;
      if (!faceMatchPassed) {
        await dbHelpers.run(
          `UPDATE kyc_applications 
           SET status = ?, rejection_reason = ?, updated_at = datetime('now','localtime') 
           WHERE application_id = ?`,
          ['rejected', 'Face verification failed. Selfie does not match the passport photo.', application.application_id]
        );

        const selfie = photos.find(p => p.photo_type === 'selfie');
        if (selfie) {
          await dbHelpers.run(
            'UPDATE photos SET face_match_score = ? WHERE id = ?',
            [faceMatchScore, selfie.id]
          );
        }

        return res.json({ 
          success: false, 
          status: 'rejected', 
          reason: 'Face verification failed. Selfie does not match the passport photo.' 
        });
      }
    }

    // Simulate duplicate check (10% chance)
    const isDuplicate = Math.random() < 0.1;

    if (isDuplicate) {
      await dbHelpers.run(
        `UPDATE kyc_applications 
         SET status = ?, rejection_reason = ?, updated_at = datetime('now','localtime') 
         WHERE application_id = ?`,
        ['rejected', 'Duplicate application detected. Aadhaar/PAN already registered.', application.application_id]
      );
      return res.json({ 
        success: false, 
        status: 'rejected', 
        reason: 'Duplicate application detected. Aadhaar/PAN already registered.' 
      });
    }

    // All checks passed - approve
    await dbHelpers.run(
      `UPDATE kyc_applications 
       SET status = ?, updated_at = datetime('now','localtime') 
       WHERE application_id = ?`,
      ['approved', application.application_id]
    );

    // Update selfie with face match score and verified status if available
    const selfie = photos.find(p => p.photo_type === 'selfie');
    if (selfie && faceMatchScore !== null) {
      await dbHelpers.run(
        'UPDATE photos SET face_match_score = ?, status = ? WHERE id = ?',
        [faceMatchScore, 'verified', selfie.id]
      );
    }

    res.json({ success: true, status: 'approved' });
  } catch (error) {
    console.error('Submit verification error:', error);
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

export default router;


