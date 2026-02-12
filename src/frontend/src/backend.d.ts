import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ICECandidate = string;
export type SDP = string;
export interface backendInterface {
    addIceCandidate(sessionCode: string, candidate: ICECandidate, isHost: boolean): Promise<void>;
    getGuestAnswer(sessionCode: string): Promise<SDP | null>;
    getGuestIceCandidates(sessionCode: string): Promise<Array<ICECandidate>>;
    getHostIceCandidates(sessionCode: string): Promise<Array<ICECandidate>>;
    getHostOffer(sessionCode: string): Promise<SDP | null>;
    guestAnswer(sessionCode: string, answer: SDP): Promise<void>;
    hostOffer(sessionCode: string, offer: SDP): Promise<void>;
}
