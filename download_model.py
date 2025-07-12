from transformers import pipeline

# Load the model and tokenizer from Hugging Face
MODEL_NAME = "jy46604790/Fake-News-Bert-Detect"
print("⏳ Downloading model...")
clf = pipeline("text-classification", model=MODEL_NAME, tokenizer=MODEL_NAME)

# Save the model to the correct folder (same as app.py)
save_path = "./ml_model_api"
clf.model.save_pretrained(save_path)
clf.tokenizer.save_pretrained(save_path)

print(f"✅ Model downloaded and saved to: {save_path}")
