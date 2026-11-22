# Acceptance criteria for the finished automator

These checks describe what Claude must demonstrate after implementation. They have not been run against a finished app in this research task.

## Local tools and actual media

1. On the user's Windows PC, `doctor` reports actual GPU/VRAM, system memory, free disk, Python/Node/FFmpeg versions, fonts and installed model identities.
2. Produce a real local TTS sample and a real animated MP4. Inspect the audio, a contact sheet and playback. A mock or placeholder is not an end-to-end media test.
3. With paid-provider credentials unset and cloud inference disabled, successfully render an original 20-60 second Short. No voice, image, inference or publishing fallback contacts a paid service.
4. Force local narration to fail. The job stops with a clear error; it must not silently call ElevenLabs, Edge TTS or a cloud voice endpoint.

## Format and content

5. Support both portrait 1080 x 1920 Shorts and landscape 1920 x 1080 long videos. Validate the final file rather than only the requested settings.
6. Boundary checks distinguish 19/20/60/61-second Shorts and 179/180/480/481-second long videos. Detect out-of-range actual narration, and handle insignificant container rounding explicitly.
7. A narration rewrite invalidates voice, alignment, affected scenes and the master. No stale caption or old audio remains.
8. Names, dates and currency amounts have tested spoken/display mappings. Deliberately unalignable words produce a visible finding, not fabricated timestamps.
9. Every important factual claim has a usable source or an explicit uncertainty label. Unsupported facts and unknown media rights fail release eligibility.
10. Inspect each channel's output at phone size. Captions, labels and the opening visual are legible. Missing assets, accidental black space and unrelated filler shots are repaired.

## Five-channel reliability

11. Run one daily batch that creates five different jobs for the five different profiles. Each follows its own audience promise, visual family and history.
12. Trigger the scheduler twice for the same local date, including simultaneous starts. It must not add duplicate daily slots.
13. Kill a worker after narration completes. Restart and show that a valid cached voice is reused while unfinished work resumes.
14. Fail one job's asset fetch. The other four jobs can finish, and the failed job retains its own clear error and bounded retry state.
15. Switching a slot from Short to long must not create a sixth output for that day. Missed schedules and daylight-saving changes must not double-publish.
16. Demonstrate bounded concurrency and model release. Record peak memory and wall time for five-job batches; do not claim the daily deadline was met without the actual measurements.

## Release and improvement

17. Without channel authorization or an enabled release policy, local exports still work and no upload is attempted.
18. With test authorization configured later, verify the authorized channel ID, explicit privacy and required video attributes before uploading a pilot.
19. Simulate an ambiguous upload timeout. Enter `upload_unknown`; reconcile before another upload request. Never test this by intentionally duplicating public posts.
20. Present a completed preview, script, evidence, rights, findings and revision history together. A technical pass is not automatically an editorial pass.
21. Fix one real visual or pronunciation problem, rerender the affected portion, and save a specific lesson with a regression check. A later relevant job should retrieve that lesson.
22. Produce a representative 3-8 minute original video and a measured five-job long/mixed batch before calling long-form daily throughput established.

## Completion report

Claude's final implementation report must distinguish implemented, tested, not tested and blocked items. Include commands actually run, output paths, measured durations, representative frames, known limitations and any remaining account setup. No income or monetization guarantee is an acceptance criterion.
