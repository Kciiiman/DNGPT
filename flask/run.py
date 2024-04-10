from model.tts.tts_wrapper import TTSWrapper
from model.stt.stt_wrapper import STTWrapper
from scipy.io.wavfile import write

if __name__ == '__main__':
    # Test TTSWrapper
    tts = TTSWrapper()
    sampling_rate, audio = tts('今天天气不错！！！', speed=1.0)
    write('./output.wav', sampling_rate, audio)
    
    # Test STTWrapper
    stt = STTWrapper()
    text = stt('./output.wav')
    print(f'speech to text: {text}')