import struct

def analyse_ipv4(data):
    """
    Déballe l'en-tête IPv4 (Standard : 20 octets)
    """
    # Segmentation des informations
    # B (1 octet) : Version + IHL (Internet Header Length).
    # B (1 octet) : Type de Service.
    # H (2 octets) : Longueur totale.
    # H (2 octets) : Identification.
    # H (2 octets) : Flags + Fragment Offset.
    # B (1 octet) : TTL (Time to Live).
    # B (1 octet) : Protocole (TCP, UDP, ICMP...).
    # H (2 octets) : Checksum de l'en-tête.
    # 4s (4 octets) : IP Source.
    # 4s (4 octets) : IP Destination.
    ip_header = struct.unpack('! B B H H H B B H 4s 4s', data[:20])
    
    # On extrait les champs principaux
    version_ihl = ip_header[0]  #On récupère le premier byte
    version = version_ihl >> 4        # On dégage les 4 premiers bits car décrit la version (déjà checké auparavant)
    ihl = (version_ihl & 0xF) * 4     # 4 derniers bits: longueur de l'entête (IHL: Internet Headert Length). On garde donc les 4 derniers bits et on le transfo en octet
    
    ttl = ip_header[5]                # Time to Live: nbr de hop restants avant destruction du paquet
    protocol = ip_header[6]           # Protocole suivant (TCP=6, UDP=17)
    src_ip = ip_header[8]             # IP Source (en octets)
    dest_ip = ip_header[9]            # IP Destination (en octets)

    # Conversion IP en txt
    src_str = ".".join(map(str, src_ip))
    dest_str = ".".join(map(str, dest_ip))

    print(f"   [IPv4] {src_str} -> {dest_str} | Protocol: {protocol} | TTL: {ttl}")

    # On retourne le protocole et les données restantes pour la suite (Couche 4)
    return protocol, data[ihl:]