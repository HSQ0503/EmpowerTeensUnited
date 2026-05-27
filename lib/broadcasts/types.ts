export type SegmentFilter =
  | { kind: "all_students" }
  | { kind: "all_mentors" }
  | { kind: "all_parents" }
  | { kind: "course_enrollees"; courseId: string }
  | { kind: "event_registrants"; eventId: string }
  | { kind: "event_attendees"; eventId: string }
  | { kind: "event_no_shows"; eventId: string }
  | {
      kind: "explicit";
      registrationIds?: string[];
      profileIds?: string[];
    };

export type ResolvedRecipient = {
  email: string;
  name: string | null;
  profileId: string | null;
};
