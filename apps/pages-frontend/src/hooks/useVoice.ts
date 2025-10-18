import { useState, useCallback, useRef, useEffect } from 'react';

const API_BASE_URL = 'https://cf-agents-api.shivanivinodkumar-jariwala.workers.dev';

export function useVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [onTranscription, setOnTranscription] = useState<((text: string) => void) | null>(null);

  // Wrap setOnTranscription to add debugging
  const setOnTranscriptionWithDebug = useCallback((callback: ((text: string) => void) | null) => {
    console.log('🔥 setOnTranscription called with:', typeof callback);
    if (callback && typeof callback === 'function') {
      setOnTranscription(callback);
    } else {
      console.log('🔥 Invalid callback provided, not setting');
    }
  }, []);

  // Debug when callback is set
  useEffect(() => {
    console.log('🔥 onTranscription callback state changed:', !!onTranscription);
    if (onTranscription) {
      console.log('🔥 Callback is now set in useVoice hook');
    } else {
      console.log('🔥 Callback is not set in useVoice hook');
    }
  }, [onTranscription]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsVoiceEnabled(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Microphone access denied. Please allow microphone access to use voice features.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const processAudio = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Transcribe audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const transcribeResponse = await fetch(`${API_BASE_URL}/api/voice/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error('Transcription failed');
      }

      const { transcription } = await transcribeResponse.json();
      
      if (transcription && typeof transcription === 'string' && transcription.trim()) {
        console.log('🔥 Valid transcription received:', transcription);
        console.log('🔥 Transcription type:', typeof transcription);
        console.log('🔥 Transcription length:', transcription.length);
        // Send transcription to chat
        if (onTranscription && typeof onTranscription === 'function') {
          console.log('🔥 Calling onTranscription callback with:', transcription);
          onTranscription(transcription);
        } else {
          console.log('🔥 No valid onTranscription callback set');
        }
      } else {
        console.log('🔥 Invalid transcription received:', transcription, typeof transcription);
      }
      
      // Synthesize response
      const synthesizeResponse = await fetch(`${API_BASE_URL}/api/voice/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `You said: ${transcription}`,
          voice: 'alloy',
          speed: 1.0
        }),
      });

      if (synthesizeResponse.ok) {
        const { audio } = await synthesizeResponse.json();
        playAudio(audio);
      }
    } catch (error) {
      console.error('Audio processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const playAudio = useCallback((base64Audio: string) => {
    try {
      const audioData = atob(base64Audio);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.play().then(() => {
        URL.revokeObjectURL(audioUrl);
      }).catch(error => {
        console.error('Audio playback error:', error);
        URL.revokeObjectURL(audioUrl);
      });
    } catch (error) {
      console.error('Audio decoding error:', error);
    }
  }, []);

  const checkMicrophonePermission = useCallback(async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setIsVoiceEnabled(permission.state === 'granted');
    } catch (error) {
      // Fallback: try to access microphone
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setIsVoiceEnabled(true);
      } catch (e) {
        setIsVoiceEnabled(false);
      }
    }
  }, []);

  return {
    isRecording,
    isVoiceEnabled,
    isProcessing,
    startRecording,
    stopRecording,
    checkMicrophonePermission,
    setOnTranscription: setOnTranscriptionWithDebug
  };
}
