const baseUrl = "https://triviapost.in:5000/api/"; 
const mediaUrl = "https://admin.triviapost.in/server/";
// const baseUrl = "http://192.168.1.83:5000/api/"; 
// const mediaUrl = "http://192.168.1.83/TriviaPost/Trivia-BackEnd/";
export const config = {
	baseApiUrl : baseUrl,
	mediaApiUrl: mediaUrl
}


// Commands for signed APK 

// 1) keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
// 2) jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk alias_name
// 3) zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk triviapost.apk
