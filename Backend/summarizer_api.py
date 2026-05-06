import torch
device = 0 if torch.cuda.is_available() else -1

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import os
import traceback
from utils import extract_text_from_pdf

# ================================
# INIT FASTAPI
# ================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# LOAD MODELS
# ================================

# English Summarizer
summarizer = pipeline(
    "summarization",
    model="facebook/bart-large-cnn",
    device=device
)

# Hindi Translator (UPDATED MODEL)
hi_tokenizer = AutoTokenizer.from_pretrained(
    "AbhiKrov/mt5-small-english-to-hindi-akrov"
)

hi_model = AutoModelForSeq2SeqLM.from_pretrained(
    "AbhiKrov/mt5-small-english-to-hindi-akrov"
)

translator_hi = pipeline(
    "text2text-generation",
    model=hi_model,
    tokenizer=hi_tokenizer,
    device=device
)

# Marathi Translator (NLLB-200 Distilled 600M)
mr_translator = pipeline(
    "translation",
    model="facebook/nllb-200-distilled-600M",
    device=device
)

# ================================
# SUMMARIZE ROUTE
# ================================
@app.post("/summarize")
async def summarize_document(
    file: UploadFile = File(...),
    language: str = Form("english")
):
    file_path = f"temp_{file.filename}"
    language = language.strip().lower()
 
    try:
        # Save PDF
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Extract Text
        text = extract_text_from_pdf(file_path)
        if not text or len(text.strip()) < 30:
            raise HTTPException(status_code=400, detail="Document text too short")

        # 1️⃣ SUMMARIZE (Always in English first)
        def split_text(text, chunk_size=500):
            words = text.split()
            for i in range(0, len(words), chunk_size):
                yield " ".join(words[i:i+chunk_size])


        summaries = []

        for chunk in split_text(text):
            result = summarizer(
            chunk,
            max_length=150,
            min_length=50,
            do_sample=False
        )
            summaries.append(result[0]["summary_text"])
        summary_text = " ".join(summaries)

        # 2️⃣ TRANSLATE (If needed)

        if language == "hindi":
            prompt = "Translate the following English text to Hindi:\n\n" + summary_text

            result = translator_hi(
                prompt,
                max_new_tokens=600,
                num_beams=5,
                repetition_penalty=2.5,
                no_repeat_ngram_size=3,
                early_stopping=True,
                do_sample=False
            )

            summary_text = result[0]["generated_text"]

        elif language == "marathi":
            result = mr_translator(
                summary_text,
                src_lang="eng_Latn",
                tgt_lang="mar_Deva"
            )
            summary_text = result[0]["translation_text"]

        return {"summary": summary_text}

    except Exception as e:
        print(f"Error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)