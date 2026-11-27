import certifi; certifi.where = lambda: "/root/.ccr/ca-bundle.crt"
import asyncio, json, edge_tts, sys
LINES = [
 ("hook",  "En diciembre, en mi casa, todo el mundo quiere internet... ¡al mismo tiempo!", "+6%", "+0Hz"),
 ("abuela","La abuela reza la novena por videollamada con el primo de Madrid... y lo regaña si no canta.", "+8%", "+0Hz"),
 ("hermano","Mi hermano, jugando en línea, grita como si fuera la final.", "+10%", "+2Hz"),
 ("mama",  "Mi mamá pone villancicos mientras hace natilla y buñuelos... que nadie puede probar todavía.", "+8%", "+0Hz"),
 ("papa",  "Mi papá, con su película... roncando a los diez minutos.", "+6%", "+0Hz"),
 ("prima", "Y mi prima, camino a la tienda, mandándole video de todo al grupo.", "+8%", "+0Hz"),
 ("ritmo", "Cada uno a su ritmo.", "+0%", "+0Hz"),
 ("claim", "Con Tigo tienes la red fija y la red móvil 5G más rápidas de Colombia.", "+4%", "+0Hz"),
 ("ookla", "Reconocidas en los Speedtest Awards de Ookla 2026.", "+6%", "+0Hz"),
 ("remate","En Tigo hay más para todos.", "+0%", "+0Hz"),
]
async def one(key, text, rate, pitch):
    c = edge_tts.Communicate(text, "es-CO-GonzaloNeural", rate=rate, pitch=pitch, boundary="WordBoundary")
    words=[]; audio=b""
    async for ch in c.stream():
        if ch["type"]=="audio": audio+=ch["data"]
        elif ch["type"]=="WordBoundary":
            words.append({"w":ch["text"],"t":ch["offset"]/1e7,"d":ch["duration"]/1e7})
    open(f"vo/{key}.mp3","wb").write(audio)
    return {"key":key,"text":text,"words":words}
async def main():
    out=[]
    for l in LINES: out.append(await one(*l))
    json.dump(out, open("vo/words.json","w"), ensure_ascii=False, indent=1)
asyncio.run(main())
