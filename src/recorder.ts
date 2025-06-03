import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AudioSet,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
} from "react-native-audio-recorder-player";
import { PermissionsAndroid, Platform } from "react-native";
import RNFS from "react-native-fs";
import { v4 as uuid } from "uuid";
import { decode as base64Decode } from "react-native-base64";

export class RecorderService {
  private recorder = new AudioRecorderPlayer();
  private recordingPath: string;

  constructor() {
    // Use CachesDirectoryPath for iOS to avoid requiring additional permissions
    const baseDir = Platform.OS === 'ios' ? RNFS.CachesDirectoryPath : RNFS.ExternalDirectoryPath;
    this.recordingPath = `${baseDir}/whisper_recording_${uuid()}.m4a`;
  }

  async start(): Promise<void> {
    try {
      // Ensure directory exists
      const dirPath = this.recordingPath.substring(0, this.recordingPath.lastIndexOf('/'));
      await RNFS.mkdir(dirPath);

      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message: "This app needs access to your microphone to record audio.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error("Microphone permission denied");
        }
      }

      // Use only valid AudioSet options
      const audioSet: AudioSet = {
        /* Android */
        AudioSourceAndroid: AudioSourceAndroidType.VOICE_RECOGNITION,
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        /* iOS */
        AVFormatIDKeyIOS: AVEncodingOption.aac,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVNumberOfChannelsKeyIOS: 1,
        AVSampleRateKeyIOS: 44100,
      };

      console.log('Starting recorder with path:', this.recordingPath);
      await this.recorder.startRecorder(this.recordingPath, audioSet);
    } catch (error) {
      console.error('Recording error:', error);
      throw new Error(
        `Failed to start recording: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async stop(): Promise<Uint8Array> {
    try {
      console.log('Stopping recorder');
      await this.recorder.stopRecorder();
      
      if (!await RNFS.exists(this.recordingPath)) {
        throw new Error('Recording file not found');
      }

      const base64 = await RNFS.readFile(this.recordingPath, "base64");
      // Use react-native-base64 to decode base64 to binary string
      const binaryString = base64Decode(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Clean up the recording file
      await RNFS.unlink(this.recordingPath).catch(console.error);
      
      return bytes;
    } catch (error) {
      console.error('Stop recording error:', error);
      throw new Error(
        `Failed to stop recording: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
