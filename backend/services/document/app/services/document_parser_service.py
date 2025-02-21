import logging
from typing import List
from io import BytesIO
import pdfplumber
from docx import Document
import pandas as pd
import nltk
from nltk.tokenize import sent_tokenize

nltk.download("punkt")

logger = logging.getLogger(__file__)


class DocumentParser:
    """Base class for document parsers"""

    def extract_text(self, file: BytesIO) -> List[str]:
        raise NotImplementedError("Subclasses must implement extract_text method")

    def split_into_chunks(self, text: str, max_chunk_size: int = 1000) -> List[str]:
        sentences = sent_tokenize(text)
        chunks = []
        current_chunk = []

        for sentence in sentences:
            if len(" ".join(current_chunk + [sentence])) <= max_chunk_size:
                current_chunk.append(sentence)
            else:
                chunks.append(" ".join(current_chunk))
                current_chunk = [sentence]

        if current_chunk:
            chunks.append(" ".join(current_chunk))
        logger.debug(f"Split text into {chunks} chunks")
        return chunks


class PDFParser(DocumentParser):
    def extract_text(self, file: BytesIO) -> List[str]:
        text = ""
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return self.split_into_chunks(text.strip())


class DOCXParser(DocumentParser):
    def extract_text(self, file: BytesIO) -> List[str]:
        doc = Document(file)
        text = "\n".join([para.text for para in doc.paragraphs])
        return self.split_into_chunks(text)


class CSVParser(DocumentParser):
    def extract_text(self, file: BytesIO) -> List[str]:
        df = pd.read_csv(file)
        text = df.to_string(index=False)
        return self.split_into_chunks(text)


def get_parser(file_extension: str) -> DocumentParser:
    parsers = {
        "pdf": PDFParser(),
        "docx": DOCXParser(),
        "doc": DOCXParser(),
        "csv": CSVParser(),
    }
    return parsers.get(file_extension, None)
