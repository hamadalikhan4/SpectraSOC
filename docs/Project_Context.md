# SpectraSOC — Master Project Context

**Project Name:** SpectraSOC

**Project Type:** Enterprise Security Operations Center (SOC) Platform

**Purpose:** Final Year Project (BS Cyber Security)

**Development Strategy:**
Build every module to enterprise quality first. After all core modules are complete, perform UI/UX polish, advanced optimizations, and production enhancements.

---

# Technology Stack

## Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- JWT Authentication

## Frontend

- React
- Vite
- Axios
- Lucide React
- React Flow
- React Simple Maps

## Threat Intelligence

- VirusTotal API
- AbuseIPDB API
- GeoIP
- Plugin Architecture

---

# Project Modules

| Module | Status |
|---------|--------|
| Authentication | ✅ Complete |
| RBAC | ✅ Complete |
| Dashboard | ✅ Complete |
| SIEM Dashboard | ✅ Complete |
| Threat Center | ✅ Complete |
| Threat Intelligence | ✅ Complete |
| Incident Response | ⏳ Next |
| Digital Forensics | ⏳ Planned |
| Honeypot Center | ⏳ Planned |
| SOAR | ⏳ Planned |
| AI Assistant | ⏳ Planned |
| Reports | ⏳ Planned |
| Administration | ⏳ Planned |

---

# Backend Architecture

```
app/
│
├── routers/
├── services/
├── repositories/
├── models/
├── schemas/
├── utils/
├── enrichers/
│      ├── base.py
│      ├── loader.py
│      ├── geoip.py
│      ├── virustotal.py
│      └── abuseipdb.py
│
├── ai/
├── core/
└── database/
```

---

# Threat Intelligence Architecture

```
IOC

↓

IOC Parser

↓

Plugin Loader

↓

GeoIP

↓

VirusTotal

↓

AbuseIPDB

↓

Unified Enrichment

↓

Threat Score Engine

↓

Threat Analysis

↓

Incident Pipeline
```

---

# IOC Types Supported

- IP
- Domain
- URL
- Email
- MD5
- SHA1
- SHA256

---

# Completed Backend Features

## IOC Parser

Automatic IOC detection.

## Plugin Loader

Automatic discovery using pkgutil/importlib.

## GeoIP Plugin

Provides:

- Country
- City
- ISP

## VirusTotal Plugin

Provides:

- Reputation
- ASN
- Network
- Malicious
- Suspicious
- Harmless
- Undetected
- Tags

## AbuseIPDB Plugin

Provides:

- Abuse Score
- Reports
- ISP
- Country
- Usage Type

## Threat Score Engine

Calculates

- Risk Score
- Severity
- Provider Scores
- Reasons

Severity

- LOW
- MEDIUM
- HIGH
- CRITICAL

---

# Threat Intelligence API

## Analyze IOC

```
POST /api/v1/threat/analyze
```

Query Parameters

```
indicator
indicator_type
auto_incident
threshold
```

Returns

- Risk Score
- Risk Level
- Provider Scores
- Reasons
- Providers
- Enrichment
- Incident Created

---

# Threat Intelligence Frontend

## Tabs

- Overview
- IOC Analysis
- IOC Database
- Sources

## Features

- IOC Search
- Risk Gauge
- Provider Breakdown
- VirusTotal Results
- AbuseIPDB Results
- GeoIP Results
- AI Threat Context
- Scoring Reasons
- Provider Health
- IOC Database

---

# Current Workflow

```
IOC

↓

Threat Analyze API

↓

Threat Intelligence

↓

Risk Score

↓

Severity

↓

Incident Pipeline

↓

Dashboard
```

---

# Completed Integrations

- GeoIP
- VirusTotal
- AbuseIPDB

---

# Current Sprint

## Sprint 3

Incident Response Pipeline

Goal:

```
IOC

↓

Threat Analysis

↓

Risk Engine

↓

Automatic Incident

↓

Incident Dashboard

↓

Timeline

↓

Evidence

↓

AI Summary
```

---

# Future Modules

## Incident Response

- Incident Timeline
- Evidence
- Assignment
- Status
- Comments

## Digital Forensics

- File Analysis
- Memory Analysis
- Timeline
- Hash Analysis

## Honeypot Center

- Cowrie
- T-Pot
- Session Viewer
- Live Attack Monitoring

## SOAR

- Playbooks
- Automated Response
- Blocking
- Ticket Creation

## AI Assistant

- Threat Explanation
- IOC Summary
- Incident Recommendation

---

# Development Principles

- Enterprise-quality architecture
- Modular codebase
- Plugin-based integrations
- Reusable services
- Production-ready APIs
- Professional SOC UI
- No duplicated logic
- Backend first, frontend second
- Complete modules before polishing

---

# Next Immediate Task

Build the Incident Pipeline and connect Threat Intelligence to automatic incident creation.

After Incident Response is complete:

1. Digital Forensics
2. Honeypot Center
3. SOAR
4. AI Assistant
5. Reports
6. Administration