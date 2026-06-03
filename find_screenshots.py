import os
import glob

app_data = r"C:\Users\LENOVO\.gemini\antigravity"
pattern = os.path.join(app_data, "**", "*section*")
print("Searching for section screenshots...")
files = glob.glob(pattern, recursive=True)
for f in files:
    print(f, "| size:", os.path.getsize(f))
