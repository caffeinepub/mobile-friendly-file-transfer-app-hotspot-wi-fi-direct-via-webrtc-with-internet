import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

actor {
  type SDP = Text;
  type ICECandidate = Text;

  let sessions = Map.empty<Text, ConnectionOffer>();

  type ConnectionOffer = {
    var offer : ?SDP; // Only set by host
    var answer : ?SDP; // Set by guest, triggers connection
    var hostIceCandidates : List.List<ICECandidate>; // Set by host, get by guest
    var guestIceCandidates : List.List<ICECandidate>; // Set by guest, get by host
  };

  public shared ({ caller }) func hostOffer(sessionCode : Text, offer : SDP) : async () {
    let newOffer : ConnectionOffer = {
      var offer = ?offer;
      var answer = null;
      var hostIceCandidates = List.empty<ICECandidate>();
      var guestIceCandidates = List.empty<ICECandidate>();
    };
    sessions.add(sessionCode, newOffer);
  };

  public shared ({ caller }) func addIceCandidate(sessionCode : Text, candidate : ICECandidate, isHost : Bool) : async () {
    switch (sessions.get(sessionCode)) {
      case (null) { Runtime.trap("Session does not exist!") };
      case (?offer) {
        if (isHost) {
          offer.hostIceCandidates.add(candidate);
        } else {
          offer.guestIceCandidates.add(candidate);
        };
      };
    };
  };

  public shared ({ caller }) func getGuestIceCandidates(sessionCode : Text) : async [ICECandidate] {
    switch (sessions.get(sessionCode)) {
      case (null) { Runtime.trap("Session does not exist!") };
      case (?offer) { offer.guestIceCandidates.toArray() };
    };
  };

  public shared ({ caller }) func getHostIceCandidates(sessionCode : Text) : async [ICECandidate] {
    switch (sessions.get(sessionCode)) {
      case (null) { Runtime.trap("Session does not exist!") };
      case (?offer) { offer.hostIceCandidates.toArray() };
    };
  };

  public shared ({ caller }) func guestAnswer(sessionCode : Text, answer : SDP) : async () {
    switch (sessions.get(sessionCode)) {
      case (null) { Runtime.trap("Session does not exist!") };
      case (?offer) { offer.answer := ?answer };
    };
  };

  public query ({ caller }) func getHostOffer(sessionCode : Text) : async ?SDP {
    switch (sessions.get(sessionCode)) {
      case (null) { null };
      case (?offer) { offer.offer };
    };
  };

  public query ({ caller }) func getGuestAnswer(sessionCode : Text) : async ?SDP {
    switch (sessions.get(sessionCode)) {
      case (null) { null };
      case (?offer) { offer.answer };
    };
  };
};
