import socket
import struct

from IPv4.main_ipv4 import analyse_ipv4
from IPv4.Couche4.main_couche4 import analyse_couche4


# Création socket
# AF_PACKET : On capture tout au niveau Ethernet (Couche 2)
# ntohs(3) : ETH_P_ALL (Tous les protocoles)
sniffer = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.ntohs(3))
#Note : Preambule and SFD not present because NIC "delete" them

try:
    print("Début Sniffer")
    while True:
        # On reçoit les données (raw_data contient la trame Ethernet complète)
        raw_data, addr = sniffer.recvfrom(65535)

        # Analyse de l'en-tête Ethernet (14 octets)
        # ! : read bits Big-Endian
        # 6s : MAC adresses source and destination (6 bytes each)
        # H : ethertype (2 bytes declaring wether IPv6, IPv4, ARP)
        eth_header = struct.unpack('! 6s 6s H', raw_data[:14])


        dest_mac, src_mac, eth_proto = eth_header
        
        if eth_proto == 0x0800: # IPv4
            # Le contenu IP commence après les 14 octets Ethernet
            ip_data = raw_data[14:]
            protocol_l4, payload = analyse_ipv4(ip_data)
            
        elif eth_proto == 0x0806: # ARP
            print("Paquet ARP détecté")

        elif eth_proto == 0x86DD: # IPv6
            print("Paquet IPv6 détecté")

except KeyboardInterrupt:
    print("\nArrêt.")