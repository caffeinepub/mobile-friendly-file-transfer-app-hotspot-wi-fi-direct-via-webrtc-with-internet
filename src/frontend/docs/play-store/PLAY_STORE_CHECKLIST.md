# Google Play Store Submission Checklist - FileDrop

This comprehensive checklist covers all steps needed to submit FileDrop to the Google Play Store.

## Prerequisites

- [ ] Google Play Developer account ($25 one-time registration fee)
- [ ] Access to Google Play Console (https://play.google.com/console)
- [ ] Release keystore generated and backed up securely
- [ ] Android device or emulator for testing

## 1. Build and Test

### Debug Testing
- [ ] Build debug APK: `cd frontend/android && ./gradlew assembleDebug`
- [ ] Install on test device: `adb install app/build/outputs/apk/debug/app-debug.apk`
- [ ] Test sender role: Create session, generate QR code
- [ ] Test receiver role: Join via manual code and QR scan
- [ ] Test file transfer: Send single file, multiple files, large files
- [ ] Test camera permission: Grant, deny, and revoke scenarios
- [ ] Test storage permission: Grant, deny, and settings navigation
- [ ] Test on multiple Android versions (minimum API 24 / Android 7.0)
- [ ] Test on different screen sizes (phone, tablet)
- [ ] Test network scenarios: Wi-Fi, mobile data, switching networks
- [ ] Test WebRTC connection: Both devices on same network, different networks

### Release Build
- [ ] Generate release keystore (see `android/keystore/README.md`)
- [ ] Configure `android/local.properties` with signing credentials
- [ ] Increment `versionCode` and `versionName` in `android/app/build.gradle`
- [ ] Build web app: `cd frontend && npm run build`
- [ ] Sync to Android: `npx cap sync android`
- [ ] Build release AAB: `cd android && ./gradlew bundleRelease`
- [ ] Verify AAB created: `app/build/outputs/bundle/release/app-release.aab`
- [ ] Test release build locally using bundletool (optional but recommended)

## 2. Prepare Store Assets

### Required Graphics
- [ ] App icon (512x512 PNG) - Available at `/assets/generated/play-store-icon.dim_512x512.png`
- [ ] Feature graphic (1024x500 PNG) - Available at `/assets/generated/play-feature-graphic.dim_1024x500.png`
- [ ] Screenshots (at least 2, up to 8):
  - [ ] Phone screenshots (1080x1920 or similar) - Available at `/assets/generated/play-screenshot-*.png`
  - [ ] Optional: 7-inch tablet screenshots (1536x2048)
  - [ ] Optional: 10-inch tablet screenshots (2048x1536)

### Store Listing Content
- [ ] Review `docs/play-store/LISTING_METADATA_EN.md` for prepared content
- [ ] App name: "FileDrop" (or your chosen name, max 50 characters)
- [ ] Short description (max 80 characters)
- [ ] Full description (max 4000 characters)
- [ ] Category: Tools or Productivity
- [ ] Content rating questionnaire completed
- [ ] Privacy Policy URL (host `public/privacy.html` on your domain or use GitHub Pages)

## 3. Google Play Console Setup

### Create Application
- [ ] Log in to Google Play Console
- [ ] Click "Create app"
- [ ] Enter app name: "FileDrop"
- [ ] Select default language: English (United States)
- [ ] Choose app or game: App
- [ ] Choose free or paid: Free
- [ ] Accept Developer Program Policies and US export laws

### Store Presence

#### Main Store Listing
- [ ] Upload app icon (512x512)
- [ ] Upload feature graphic (1024x500)
- [ ] Upload phone screenshots (minimum 2)
- [ ] Enter app name
- [ ] Enter short description
- [ ] Enter full description
- [ ] Select app category: Tools
- [ ] Add tags (optional): file transfer, peer-to-peer, WebRTC
- [ ] Enter contact email
- [ ] Enter privacy policy URL

#### Store Settings
- [ ] Select app category
- [ ] Add store listing contact details
- [ ] Set up merchant account (if offering in-app purchases - N/A for FileDrop)

### Content Rating
- [ ] Start questionnaire
- [ ] Select category: Utility, Productivity, Communication or Other
- [ ] Answer questions honestly:
  - Violence: None
  - Sexual content: None
  - Profanity: None
  - Controlled substances: None
  - User-generated content: No (files are transferred directly, not shared publicly)
  - User communication: Yes (peer-to-peer file transfer)
  - Personal information: No
  - Location sharing: No
- [ ] Submit for rating
- [ ] Apply rating to release

### Data Safety

- [ ] Review `docs/play-store/DATA_SAFETY_NOTES.md`
- [ ] Complete Data Safety form:
  - [ ] Does your app collect or share user data? **NO**
  - [ ] Data types collected: **None**
  - [ ] Is all data encrypted in transit? **YES (session signaling only)**
  - [ ] Can users request data deletion? **Not applicable (no data collected)**
- [ ] Declare camera permission usage:
  - [ ] Purpose: QR code scanning only
  - [ ] Optional feature (users can enter codes manually)
  - [ ] Processed on-device only
  - [ ] Not recorded or transmitted
- [ ] Declare storage permission usage:
  - [ ] Purpose: File selection for transfer
  - [ ] User-initiated only (when tapping "Click to select files")
  - [ ] Files not uploaded to servers
  - [ ] Direct peer-to-peer transfer only

### App Access
- [ ] Provide instructions for testing (if app requires login):
  - FileDrop uses Internet Identity (no test credentials needed)
  - Explain that two devices are needed to test file transfer
- [ ] Provide demo video (optional but helpful)

### Ads
- [ ] Does your app contain ads? **NO**

## 4. Release Setup

### Production Track
- [ ] Go to "Production" in left sidebar
- [ ] Click "Create new release"
- [ ] Upload `app-release.aab`
- [ ] Enter release name: "1.0.0" (or your version)
- [ ] Enter release notes:
  ```
  Initial release of FileDrop
  
  Features:
  - Direct peer-to-peer file transfer
  - No internet required (works on local Wi-Fi)
  - QR code scanning for easy session joining
  - Fast and secure WebRTC connections
  - No file size limits
  - Privacy-first: no data collection
  ```
- [ ] Set rollout percentage: 100% (or staged rollout: 20%, 50%, 100%)
- [ ] Review release

### Countries and Regions
- [ ] Select countries/regions for distribution
- [ ] Recommended: Start with your country, expand after testing
- [ ] Consider: Worldwide distribution after initial testing period

### Pricing and Distribution
- [ ] Set app as Free
- [ ] Select countries for distribution
- [ ] Confirm app complies with local laws in selected regions
- [ ] Review export compliance requirements

## 5. Pre-Launch Testing

### Internal Testing Track (Optional but Recommended)
- [ ] Create internal testing release
- [ ] Add internal testers (email addresses)
- [ ] Distribute to internal testers
- [ ] Collect feedback on functionality
- [ ] Fix any critical issues

### Pre-Launch Report
- [ ] Review automated pre-launch report from Google
- [ ] Address any critical issues found
- [ ] Check for crashes on different devices
- [ ] Verify app works on various Android versions

## 6. Final Review

### App Content
- [ ] Verify all screenshots are accurate and up-to-date
- [ ] Ensure description accurately represents app functionality
- [ ] Confirm privacy policy is accessible and accurate
- [ ] Review all store listing content for accuracy

### Technical Checks
- [ ] Verify app doesn't crash on startup
- [ ] Test file transfer functionality end-to-end
- [ ] Verify camera permission handling
- [ ] Verify storage permission handling and error messages

### Policy Compliance
- [ ] Review Google Play Developer Program Policies
- [ ] Verify data safety declarations are accurate
- [ ] Confirm app doesn't violate any content policies

## 7. Submit for Review

- [ ] Review all sections in Play Console for completeness
- [ ] Click "Review release" in Production track
- [ ] Review all information one final time
- [ ] Click "Start rollout to Production"
- [ ] Monitor email for review status updates

## 8. Post-Submission

### Monitoring
- [ ] Check Play Console daily for review status
- [ ] Respond promptly to any policy violation notices
- [ ] Monitor crash reports and ANRs

### After Approval
- [ ] Announce app launch on social media (optional)
- [ ] Monitor user reviews and ratings
- [ ] Respond to user feedback
- [ ] Track download and engagement metrics

### Ongoing Maintenance
- [ ] Plan regular updates with bug fixes
- [ ] Keep dependencies up to date
- [ ] Respond to user reviews
- [ ] Update privacy policy if data practices change

## Common Issues and Solutions

### Review Rejection Reasons
- **Misleading content:** Ensure description accurately represents app functionality
- **Privacy policy issues:** Verify privacy policy is accessible and accurate
- **Data safety inaccuracies:** Double-check Data Safety declarations match actual behavior
- **Permission issues:** Ensure permissions are properly explained and justified

### Technical Issues
- **App crashes on startup:** Check initialization and permissions
- **Large APK size:** Use AAB format and enable app bundle optimization
- **Permission errors:** Verify manifest declarations and runtime permission handling

## Resources

- [Google Play Console](https://play.google.com/console)
- [Google Play Developer Policies](https://play.google.com/about/developer-content-policy/)
- [Android Developer Documentation](https://developer.android.com/)
- [Capacitor Documentation](https://capacitorjs.com/docs)

---

**Last Updated:** February 12, 2026
**App Version:** 1.0.0
