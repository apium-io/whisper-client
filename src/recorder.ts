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
  private recordingPath = `${RNFS.CachesDirectoryPath}/${uuid()}.m4a`;

  async start(): Promise<void> {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
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
      };

      await this.recorder.startRecorder(this.recordingPath, audioSet);
    } catch (error) {
      throw new Error(
        `Failed to start recording: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async stop(): Promise<Uint8Array> {
    try {
      await this.recorder.stopRecorder();
      const base64 = await RNFS.readFile(this.recordingPath, "base64");
      // Use react-native-base64 to decode base64 to binary string
      const binaryString = base64Decode(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (error) {
      throw new Error(
        `Failed to stop recording: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
