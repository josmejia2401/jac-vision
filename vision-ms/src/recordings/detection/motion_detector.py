import cv2
import numpy as np

class MotionDetector:

    def __init__(self, threshold: int = 25, min_area: int = 5000, alpha=0.1):
        self.threshold = threshold
        self.min_area = min_area
        self.alpha = alpha  # tasa de actualización del fondo
        self.background = None

    def detect(self, frame) -> float:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)

        # inicializar fondo
        if self.background is None:
            self.background = gray.astype("float")
            return 0.0

        # actualizar fondo suavemente
        cv2.accumulateWeighted(gray, self.background, self.alpha)
        background_frame = cv2.convertScaleAbs(self.background)

        # detectar diferencia
        diff = cv2.absdiff(background_frame, gray)
        _, thresh = cv2.threshold(diff, self.threshold, 255, cv2.THRESH_BINARY)

        thresh = cv2.dilate(thresh, None, iterations=2)
        thresh = cv2.erode(thresh, None, iterations=2)

        motion_pixels = np.count_nonzero(thresh)

        h, w = gray.shape
        movement_score = motion_pixels / (h * w)

        return movement_score if motion_pixels > self.min_area else 0.0
