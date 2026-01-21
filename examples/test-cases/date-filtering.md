# Date Filtering Test Cases

This file contains tasks with various dates to test date filtering functionality.

## Overdue Tasks (before today: 2026-01-19)

- [ ] Task overdue by 1 day @test !!! #overdue (2026-01-18)
- [ ] Task overdue by 3 days @test !! #overdue (2026-01-16)
- [ ] Task overdue by 1 week @test ! #overdue (2026-01-12)
- [ ] Task overdue by 1 month @test #overdue (2025-12-19)

## Due Today (2026-01-19)

- [ ] Task due today - urgent @test !!! #today (2026-01-19)
- [ ] Task due today - high @test !! #today (2026-01-19)
- [ ] Task due today - normal @test ! #today (2026-01-19)
- [ ] Task due today - low @test #today (2026-01-19)

## Due This Week (Jan 19-25, 2026)

- [ ] Due tomorrow @test !! #this-week (2026-01-20)
- [ ] Due in 2 days @test !! #this-week (2026-01-21)
- [ ] Due in 3 days @test ! #this-week (2026-01-22)
- [ ] Due in 4 days @test ! #this-week (2026-01-23)
- [ ] Due in 5 days @test #this-week (2026-01-24)
- [ ] Due end of week @test #this-week (2026-01-25)

## Due Next Week

- [ ] Due next Monday @test !! #next-week (2026-01-26)
- [ ] Due in 8 days @test ! #next-week (2026-01-27)
- [ ] Due in 10 days @test #next-week (2026-01-29)

## Due Later

- [ ] Due in February @test !! #later (2026-02-15)
- [ ] Due in March @test ! #later (2026-03-01)
- [ ] Due in 6 months @test #later (2026-07-19)

## No Due Date

- [ ] Task without due date - urgent @test !!! #no-date
- [ ] Task without due date - high @test !! #no-date
- [ ] Task without due date - normal @test ! #no-date
- [ ] Task without due date - low @test #no-date

## Completed Tasks with Dates

- [x] Completed task - was overdue @test !!! #completed (2026-01-15)
- [x] Completed task - was due today @test !! #completed (2026-01-19)
- [x] Completed task - was due future @test ! #completed (2026-01-22)
