import os, time
from dotenv import load_dotenv
load_dotenv()

from hsnManager.utils import rerank  # adjust import path if needed

candidates = [
    {'code': '03019400', 'description': 'LIVE FISH-OTHER LIVE FISH-- BLUEFIN TUNAS (THUNNUS THYNNUS)', 'gst_rate': 3.0},
    {'code': '03019500', 'description': 'LIVE FISH-OTHER LIVE FISH--SOUTHERN BLUEFIN TUNAS (THUNNUS MACCOYII)', 'gst_rate': 3.0},
    {'code': '03038930', 'description': 'RIBBON FISH', 'gst_rate': 3.0},
    {'code': '03042040', 'description': 'FISH FILLETS AND OTHER FISH MEAT(WHETHER OR NOT MINCED), FRESH,CHILLED OR FROZEN FROZEN FILLETS TUNA', 'gst_rate': 3.0},
    {'code': '03023500', 'description': 'FISH, FRESH OR CHILLED, EXCLUDING FISH FILLETS AND OTHER FISH MEAT OF HEADING 0304 TUNAS...', 'gst_rate': 3.0},
]

start = time.time()
result = rerank("bluefin tuna", candidates)
print(f"Took {time.time() - start:.1f}s")
print(result)