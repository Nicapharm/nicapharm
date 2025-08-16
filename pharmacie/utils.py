# pharmacie/utils.py
import subprocess
import os
import string
import platform
from ctypes import windll

def get_usb_path():
    """Détecte automatiquement le chemin de la clé USB multi-OS"""
    system = platform.system()
    
    try:
        if system == "Linux":
            # Détection Linux
            result = subprocess.check_output(["lsblk", "-o", "MOUNTPOINT", "-n", "-l"]).decode()
            mounts = [line for line in result.split('\n') if line.startswith('/media/')]
            if mounts:
                return mounts[0]
        
        elif system == "Darwin":  # MacOS
            # Détection Mac
            result = subprocess.check_output(["df"]).decode()
            for line in result.split('\n'):
                if '/Volumes' in line:
                    parts = line.split()
                    if len(parts) > 5 and '/Volumes' in parts[5]:
                        return parts[5]
        
        elif system == "Windows":
            # Détection Windows
            drives = []
            bitmask = windll.kernel32.GetLogicalDrives()
            for letter in string.ascii_uppercase:
                if bitmask & 1:
                    drive_path = f"{letter}:\\"
                    # Vérifie si c'est un disque amovible
                    if os.path.exists(drive_path):
                        drives.append(drive_path)
                bitmask >>= 1
            
            # Préfère les disques amovibles
            for drive in drives:
                if "removable" in subprocess.check_output(["fsutil", "fsinfo", "drivetype", drive]).decode().lower():
                    return drive
            if drives:
                return drives[0]  # Retourne la première clé USB trouvée
                
    except Exception as e:
        print(f"Erreur détection USB: {e}")
    
    # Fallback : vérifie les chemins courants
    common_paths = [
        "/media/usb", "/mnt/usb",  # Linux
        "/Volumes/USB",            # Mac
        "D:\\", "E:\\", "F:\\"     # Windows
    ]
    
    for path in common_paths:
        if os.path.exists(path):
            return path
    
    return None  # Aucune clé détectée