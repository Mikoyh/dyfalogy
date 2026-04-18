# Firestore Security Specification - Dyfa OSN Biologi

## 1. Data Invariants
- **Users**: Unique and immutable `uid`. Email is PII and restricted to owner.
- **Conversations**: Must have a `participants` list and a `type` ('ai' or 'p2p').
- **Messages**: Must belong to a valid `conversation` where the sender is a participant.
- **Forum Topics**: `authorId` must match the actual user. `replyCount` updated only by system or via reply triggers.
- **SRS Flashcards**: Owned by the user, specific review schedules.

## 2. The Dirty Dozen (Forbidden Payloads)
1. **Identity Spoofing**: `create` a message with `senderId` of another user.
2. **Access Escalation**: `read` another user's `flashcards` or `quizResults`.
3. **Ghost Conversation**: `create` a conversation with a `participants` list not containing self.
4. **Chat Hijack**: `read` messages in a conversation where I am not a participant.
5. **PII Leak**: `read` another user's document to see their `email`.
6. **State Backdoor**: `update` a quiz result after it's been submitted.
7. **Role Forgery**: `update` own user profile to set `isAdmin: true`.
8. **Shadow Field Injection**: `update` a conversation with `vulnerability: "injected"`.
9. **History Manipulation**: `update` or `delete` an AI response in chat history.
10. **Forum Spam**: `create` a forum topic as another user.
11. **Resource Poisoning**: Use a 2MB string for `displayName`.
12. **Timestamp Fraud**: Set `updatedAt` to a future date instead of `request.time`.

## 3. Test Coverage Requirements
The `firestore.rules` must reject all above payloads with `PERMISSION_DENIED`.
