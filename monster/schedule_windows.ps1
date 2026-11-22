# Registers a daily Windows Task Scheduler job (06:30 local) that fills the five slots once and produces them.
# Missed runs (PC off) catch up once on the next start, bounded by runtime.catchup_days.
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$action = New-ScheduledTaskAction -Execute "$here\.venv\Scripts\python.exe" -Argument "-m mya daily --catchup" -WorkingDirectory $here
$trigger = New-ScheduledTaskTrigger -Daily -At 6:30am
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 10) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName "MonsterYouTubeAutomator-daily" -Action $action -Trigger $trigger -Settings $settings -Force
