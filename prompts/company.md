# Musa — Platform Context

Musa operates in Brazil connecting three entities in waste/residue logistics:

- **Generator**: companies (malls, restaurants, parks) that produce waste and create collect demands
- **Hauler**: transporters with certified vehicles that execute collections (haul_service)
- **Receiver**: treatment facilities that receive and process waste (reception_service)

## Core Matching Logic

- `demand` = material + packaging + treatment (Generator)
- `svc_haul` = material + packaging (Hauler)
- `svc_reception` = material + treatment (Receiver)

A **contract** forms when demand + svc_haul + svc_reception align.
Contracts generate **collects** based on frequency settings (monthly or bi-weekly, specific weekdays).

## Regulatory Context

Operates under Brazilian waste transport laws.
Haulers must meet vehicle specs per residue type. Receivers must apply correct treatment methods.
System emits required transport documents.
