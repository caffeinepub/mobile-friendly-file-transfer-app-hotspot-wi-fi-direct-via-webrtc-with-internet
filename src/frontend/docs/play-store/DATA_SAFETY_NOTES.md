# Google Play Data Safety Questionnaire - FileDrop

This document provides answers for the Google Play Console Data Safety section based on FileDrop's current implementation.

## Data Collection and Security

### Does your app collect or share any of the required user data types?

**Answer: NO**

FileDrop does not collect or share any user data. All file transfers happen directly between devices using peer-to-peer WebRTC connections. No file data, personal information, or device identifiers are collected, stored, or transmitted to servers.

## Detailed Breakdown

### Personal Information
- **Name:** Not collected
- **Email address:** Not collected
- **User IDs:** Not collected (Internet Identity provides anonymous authentication)
- **Address:** Not collected
- **Phone number:** Not collected
- **Race and ethnicity:** Not collected
- **Political or religious beliefs:** Not collected
- **Sexual orientation or gender identity:** Not collected
- **Other personal info:** Not collected

### Financial Information
- **User payment info:** Not collected
- **Purchase history:** Not collected
- **Credit score:** Not collected
- **Other financial info:** Not collected

### Health and Fitness
- **Health info:** Not collected
- **Fitness info:** Not collected

### Messages
- **Emails:** Not collected
- **SMS or MMS:** Not collected
- **Other in-app messages:** Not collected (files are transferred directly, not stored)

### Photos and Videos
- **Photos:** Not collected (files are transferred peer-to-peer, not uploaded to servers)
- **Videos:** Not collected

### Audio Files
- **Voice or sound recordings:** Not collected
- **Music files:** Not collected
- **Other audio files:** Not collected

### Files and Docs
- **Files and docs:** Not collected (transferred directly between devices, never stored on servers)

### Calendar
- **Calendar events:** Not collected

### Contacts
- **Contacts:** Not collected

### App Activity
- **App interactions:** Not collected
- **In-app search history:** Not collected
- **Installed apps:** Not collected
- **Other user-generated content:** Not collected
- **Other actions:** Not collected

### Web Browsing
- **Web browsing history:** Not collected

### App Info and Performance
- **Crash logs:** Not collected (no crash reporting service integrated)
- **Diagnostics:** Not collected
- **Other app performance data:** Not collected

### Device or Other IDs
- **Device or other IDs:** Not collected

## Data Security

### Is all of the user data collected by your app encrypted in transit?

**Answer: YES (for session signaling only)**

All WebRTC connections use built-in encryption (DTLS-SRTP). Session signaling data (session codes and WebRTC connection metadata) transmitted to the Internet Computer blockchain is encrypted in transit via HTTPS. No user files or personal data are transmitted to servers.

### Do you provide a way for users to request that their data is deleted?

**Answer: NOT APPLICABLE**

FileDrop does not collect or store user data. Session metadata expires automatically after 10 minutes and is not associated with any user identity.

## Camera Permission

### Why does the app request camera permission?

The app requests camera permission solely for QR code scanning to make joining sessions easier. Camera usage:
- Is optional (users can enter codes manually)
- Happens entirely on-device
- Is never recorded, stored, or transmitted
- Only activates when user explicitly chooses "Scan QR Code"

## Storage Permission

### Why does the app request storage permission?

The app requests storage/media access permission to allow users to select files for transfer. Storage permission:
- Is requested only when user taps "Click to select files"
- Is used solely to access the file picker
- Does not upload or store files on servers
- Files are transferred directly peer-to-peer

## Internet Identity

FileDrop uses Internet Identity for authentication:
- Internet Identity is a privacy-preserving authentication system
- It does not share personal information with FileDrop
- It provides anonymous authentication using cryptographic keys
- No user data is collected through this authentication method

## Summary

**FileDrop is a privacy-first application with zero data collection:**
- No personal data collection
- No file storage on servers
- Direct peer-to-peer transfers only
- Temporary session data expires in 10 minutes
- No advertising or analytics
- Camera used only for optional QR scanning (on-device only)
- Storage permission used only for file selection

## Compliance Notes

- **GDPR:** No user data is collected, so GDPR data processing requirements do not apply.
- **COPPA:** App is not directed at children under 13. No data collection means COPPA compliance is inherent.
- **CCPA:** No personal information is collected or sold.

## Play Console Data Safety Declaration

When filling out the Data Safety form in Play Console:

1. **Does your app collect or share user data?** NO
2. **Data types collected:** None
3. **Data usage:** Not applicable
4. **Data handling:** Not applicable

## Updates

If future versions modify data collection practices, this document and the Play Console Data Safety section must be updated accordingly.

---

**Last Updated:** February 12, 2026
**App Version:** 1.0.0
