from app.detection.engine import DetectionEngine


engine = DetectionEngine()


def analyze_log(log: dict):
    return engine.analyze(log)