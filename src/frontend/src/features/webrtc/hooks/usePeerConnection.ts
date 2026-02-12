import { useState, useEffect, useCallback, useRef } from 'react';
import { useActor } from '../../../hooks/useActor';
import { useQuery } from '@tanstack/react-query';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function usePeerConnection(sessionCode: string, role: 'sender' | 'receiver') {
  const { actor } = useActor();
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [connectionState, setConnectionState] = useState<string>('new');
  const [error, setError] = useState<string | null>(null);
  const iceCandidatesRef = useRef<RTCIceCandidate[]>([]);
  const hasCreatedOfferRef = useRef(false);
  const hasCreatedAnswerRef = useRef(false);

  // Initialize peer connection
  useEffect(() => {
    if (!sessionCode) return;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (event) => {
      if (event.candidate && actor) {
        const candidateJson = JSON.stringify(event.candidate.toJSON());
        actor
          .addIceCandidate(sessionCode, candidateJson, role === 'sender')
          .catch((err) => console.error('Failed to add ICE candidate:', err));
      }
    };

    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
      if (pc.connectionState === 'failed') {
        setError('Connection failed. Please try again.');
      }
    };

    if (role === 'sender') {
      const dc = pc.createDataChannel('fileTransfer', {
        ordered: true,
      });
      dc.onopen = () => {
        setDataChannel(dc);
      };
      dc.onerror = (err) => {
        console.error('Data channel error:', err);
        setError('Data channel error');
      };
    } else {
      pc.ondatachannel = (event) => {
        const dc = event.channel;
        dc.onopen = () => {
          setDataChannel(dc);
        };
        dc.onerror = (err) => {
          console.error('Data channel error:', err);
          setError('Data channel error');
        };
      };
    }

    setPeerConnection(pc);

    return () => {
      pc.close();
    };
  }, [sessionCode, role, actor]);

  // Create offer (sender)
  const createOffer = useCallback(async () => {
    if (!peerConnection || !actor || hasCreatedOfferRef.current) return;
    hasCreatedOfferRef.current = true;

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      await actor.hostOffer(sessionCode, offer.sdp!);
    } catch (err) {
      console.error('Failed to create offer:', err);
      setError('Failed to create connection offer');
    }
  }, [peerConnection, actor, sessionCode]);

  // Poll for answer (sender)
  useQuery({
    queryKey: ['guestAnswer', sessionCode],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getGuestAnswer(sessionCode);
    },
    enabled: !!actor && role === 'sender' && !!peerConnection && connectionState !== 'connected',
    refetchInterval: 1000,
    retry: false,
  });

  // Poll for offer (receiver)
  const { data: hostOffer } = useQuery({
    queryKey: ['hostOffer', sessionCode],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getHostOffer(sessionCode);
    },
    enabled: !!actor && role === 'receiver' && !!peerConnection,
    refetchInterval: 1000,
    retry: false,
  });

  // Create answer when offer is received (receiver)
  const createAnswer = useCallback(async () => {
    if (!peerConnection || !actor || !hostOffer || hasCreatedAnswerRef.current) return;
    hasCreatedAnswerRef.current = true;

    try {
      await peerConnection.setRemoteDescription({
        type: 'offer',
        sdp: hostOffer,
      });

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      await actor.guestAnswer(sessionCode, answer.sdp!);
    } catch (err) {
      console.error('Failed to create answer:', err);
      setError('Failed to create connection answer');
    }
  }, [peerConnection, actor, hostOffer, sessionCode]);

  // Poll for guest answer and set remote description (sender)
  useQuery({
    queryKey: ['applyGuestAnswer', sessionCode],
    queryFn: async () => {
      if (!actor || !peerConnection) return null;
      const answer = await actor.getGuestAnswer(sessionCode);
      if (answer && peerConnection.remoteDescription === null) {
        await peerConnection.setRemoteDescription({
          type: 'answer',
          sdp: answer,
        });
      }
      return answer;
    },
    enabled:
      !!actor &&
      role === 'sender' &&
      !!peerConnection &&
      peerConnection.remoteDescription === null &&
      connectionState !== 'connected',
    refetchInterval: 1000,
    retry: false,
  });

  // Poll for ICE candidates
  useQuery({
    queryKey: ['iceCandidates', sessionCode, role],
    queryFn: async () => {
      if (!actor || !peerConnection) return [];
      const candidates =
        role === 'sender'
          ? await actor.getGuestIceCandidates(sessionCode)
          : await actor.getHostIceCandidates(sessionCode);

      for (const candidateJson of candidates) {
        try {
          const candidate = JSON.parse(candidateJson);
          const iceCandidate = new RTCIceCandidate(candidate);
          
          // Check if we've already added this candidate
          const isDuplicate = iceCandidatesRef.current.some(
            (c) => c.candidate === iceCandidate.candidate
          );
          
          if (!isDuplicate && peerConnection.remoteDescription) {
            await peerConnection.addIceCandidate(iceCandidate);
            iceCandidatesRef.current.push(iceCandidate);
          }
        } catch (err) {
          console.error('Failed to add ICE candidate:', err);
        }
      }
      return candidates;
    },
    enabled: !!actor && !!peerConnection && connectionState !== 'connected',
    refetchInterval: 1000,
    retry: false,
  });

  return {
    peerConnection,
    dataChannel,
    connectionState,
    error,
    createOffer,
    createAnswer,
  };
}
