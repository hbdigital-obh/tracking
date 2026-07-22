import threading, requests, time

BASE_URL = "http://localhost:8000"
NB_REQUETES = 1000
NB_THREADS = 50
resultats = {"ok": 0, "erreur": 0, "temps": []}
lock = threading.Lock()

def faire_clic():
    debut = time.time()
    try:
        r = requests.get(BASE_URL + "/c/jean-dupont/credit-agricole", allow_redirects=False, timeout=5)
        fin = time.time()
        with lock:
            if r.status_code in [200, 302]:
                resultats["ok"] += 1
            else:
                resultats["erreur"] += 1
            resultats["temps"].append((fin - debut) * 1000)
    except:
        with lock:
            resultats["erreur"] += 1

print("Demarrage test 1000 requetes...")
debut_total = time.time()
threads = [threading.Thread(target=faire_clic) for _ in range(NB_REQUETES)]
actifs = []
for t in threads:
    while len([x for x in actifs if x.is_alive()]) >= NB_THREADS:
        time.sleep(0.01)
    t.start()
    actifs.append(t)
for t in threads:
    t.join()
fin_total = time.time()
temps_total = fin_total - debut_total
temps_moyen = sum(resultats["temps"]) / len(resultats["temps"]) if resultats["temps"] else 0
print(f"OK: {resultats['ok']} | Erreurs: {resultats['erreur']}")
print(f"Temps total: {temps_total:.2f}s | Req/sec: {NB_REQUETES/temps_total:.1f}")
print(f"Temps moyen: {temps_moyen:.1f}ms | Max: {max(resultats['temps']):.1f}ms")