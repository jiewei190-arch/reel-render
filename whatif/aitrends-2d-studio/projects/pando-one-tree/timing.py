"""Re-time story/shots.json from lines.json + the voice (reuses justinclips/tools/build_short.py's time stage: Whisper small
script-aligned words -> shot starts at lines / words). Usage (from whatif/aitrends-2d-studio):
    ~/.venvs/chatterbox/bin/python projects/pando-one-tree/timing.py"""
import json, os, sys, types
HERE = os.path.dirname(os.path.abspath(__file__)); KIT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(KIT, '..', '..', 'justinclips', 'tools')); import build_short as B
a = types.SimpleNamespace(whisper_py=sys.executable)
B.stage_time(a, HERE, json.load(open(os.path.join(HERE, 'lines.json'))), KIT)
