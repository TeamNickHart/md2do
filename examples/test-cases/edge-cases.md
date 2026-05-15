# Edge Cases and Special Scenarios

This file tests edge cases and special parsing scenarios.

## Special Characters in Task Text

- [ ] Task with (parentheses) in title @alice ! #special
- [ ] Task with [brackets] in title @bob !! #special
- [ ] Task with "quotes" in title @charlie ! #special
- [ ] Task with @mention in text but assignee at end !! @dana #special
- [ ] Task with multiple @alice @bob but first wins ! #special
- [ ] Task with #hashtag in text and tags #special #test

## Very Long Task Descriptions

- [ ] This is a very long task description that contains a lot of text to test how the parser and formatter handle longer content. It should wrap properly and display correctly in all output formats including pretty, table, and JSON @alice !! #long #description #testing #due:2026-01-25

## Tasks with URL-like Content

- [ ] Deploy to https://example.com @alice !!! #devops #deployment #due:2026-01-20
- [ ] Fix API endpoint /api/v1/users @bob !! #backend #api #due:2026-01-21
- [ ] Update docs at docs.example.com/guide @charlie ! #docs #due:2026-01-22

## Tasks with Code References

- [ ] Fix bug in `handleSubmit()` function @alice !! #bug #code #due:2026-01-23
- [ ] Refactor `UserService.ts` module @bob ! #refactor #code #due:2026-01-24
- [ ] Update `README.md` file @charlie #docs #code #due:2026-01-25

## Empty or Minimal Tasks

- [ ] @alice
- [ ] !!!
- [ ] #tag
- [ ] #due:2026-01-26
- [ ] Task

## Tasks with emoji (if supported)

- [ ] Add 🎨 design system @alice !! #design #due:2026-01-27
- [ ] Fix 🐛 in login @bob !!! #bug #due:2026-01-28
- [ ] Write 📚 documentation @charlie ! #docs #due:2026-01-29

## Tasks with Multiple Dates (parser should take last one)

- [ ] Task with date #due:2025-12-25 mentioned and actual due date @alice ! #multiple-dates #due:2026-01-30

## Tasks with Priority Variations

- [ ] Task with space before priority @alice !!! #priority
- [ ] Task with priority in middle !!! @bob #priority
- [ ] Task !!! with priority right after checkbox @charlie #priority

## Nested List Tasks (if supported)

- [ ] Parent task @alice !! #parent #due:2026-01-25
  - [ ] Subtask 1 @alice ! #subtask
  - [ ] Subtask 2 @alice ! #subtask
  - [x] Completed subtask @alice #subtask

## Tasks with Mixed Completion Status

- [x] Old completed task from last year @alice !! #old #due:2025-06-15
- [x] Recently completed task @bob ! #recent #due:2026-01-15
- [ ] Current task @charlie !! #current #due:2026-01-30
- [ ] Future task @dana ! #future #due:2026-06-15
