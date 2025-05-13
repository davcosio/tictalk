from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import requests
import os
from dotenv import load_dotenv
import pytz  # Para zona horaria de CDMX

app = FastAPI()

# Configura CORS para el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
)

load_dotenv()
API_KEY = os.getenv("OPENWEATHER_API_KEY")
CIUDAD = "Ciudad de México"

@app.get("/comando")
async def procesar_comando(comando: str):
    """Procesa comandos de voz (adaptado de tu método decidir_accion)"""
    comando = comando.lower()
    
    if "hora" in comando:
        return await obtener_hora()
    elif "fecha" in comando or "día es hoy" in comando:
        return await obtener_fecha()
    elif "clima" in comando or "tiempo" in comando:
        return await obtener_clima()
    else:
        return {"mensaje": f"No entendí el comando: {comando}"}

@app.get("/hora")
async def obtener_hora():
    """Adaptación de tu método decir_hora"""
    tz = pytz.timezone('America/Mexico_City')
    ahora = datetime.now(tz).strftime("%H:%M")
    return {"mensaje": f"Son las {ahora}"}

@app.get("/fecha")
async def obtener_fecha():
    """Adaptación de tu método decir_fecha"""
    meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
             "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
    hoy = datetime.now()
    return {"mensaje": f"Hoy es {hoy.day} de {meses[hoy.month - 1]} del {hoy.year}"}

@app.get("/clima")
async def obtener_clima():
    """Adaptación de tu método decir_clima"""
    try:
        if not API_KEY:
            raise HTTPException(status_code=500, detail="API key no configurada")
        
        url = f"http://api.openweathermap.org/data/2.5/weather?q={CIUDAD}&appid={API_KEY}&units=metric&lang=es"
        response = requests.get(url)
        data = response.json()
        
        if response.status_code == 200:
            temp = data['main']['temp']
            desc = data['weather'][0]['description']
            return {"mensaje": f"Clima en {CIUDAD}: {desc}, temperatura de {temp}°C"}
        else:
            raise HTTPException(status_code=400, detail=data.get("message", "Error desconocido"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))