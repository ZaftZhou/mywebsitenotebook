import base64
import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(r"E:\WEB\mywebsitenotebook")
TEMP = ROOT / "tmp" / "pdfs" / "cv-zhou"
OUTPUT = ROOT / "output" / "templates" / "CV_Zhou_resume_template.json"


def data_url(path: Path, mime_type: str) -> str:
    return f"data:{mime_type};base64," + base64.b64encode(path.read_bytes()).decode("ascii")


resume = {
    "personal": {
        "fullName": "ZHOUBOWEN",
        "role": "AI-Driven Software Development Engineer |Product designer| 3D & Technical Art",
        "email": "zhoubowen.skyhouse@gmail.com",
        "phone": "+358 415710055",
        "address": "Turku",
        "linkedin": "https://www.linkedin.com/in/bowen-zhou-skyhouse/",
        "website": "https://www.zhou.studio",
        "summary": "I recently graduated from Turku University of Applied Science and have decided to build my career in Finland long term.I will begin my Master’s studies in the Turku Universtiy this autumn. I’m currently learning Finnish to integrate better into the local working culture. AI-driven product developer focused on applying AI to the entire build process. I rapidly translate ideas into prototypes, tighten feedback loops through automation, and deliver usable features with strong UX awareness. I work across product design, UX, and implementation, and I’m confident guiding AI-generated code to production-ready results.",
        "avatar": data_url(TEMP / "extract-p1-2-X18.jpg", "image/jpeg"),
    },
    "experience": [
        {
            "id": 101,
            "role": "Founder & Full-Stack Developer",
            "company": "SkyhouseZhou-Self-employed",
            "date": "1.2026-Now",
            "location": "Turku,Finland",
            "description": "• Owned the product end to end, from mobile engineering and backend architecture to data workflows, performance optimization, and release readiness.\n• Designed an AI-powered content pipeline to automate daily content sourcing, generation, and publishing, substantially reducing manual operations.\n• Implemented an AI-assisted feedback loop that translated user feedback into faster content improvements and data updates.\n• Built a centralized Firebase/Firestore content system supporting nearly 3,000 cloud-managed vocabulary items and shared learning materials.\nAchievement: Independently delivered an AI-enabled learning product(LILT) by combining full-stack engineering, workflow automation, and scalable content operations to accelerate iteration and improve product reliability.",
        },
        {
            "id": 102,
            "role": "Intern (VINCE Project)—Unity Developer",
            "company": "Turku University of Applied Sciences · Futuristic Interactive Technologies",
            "date": "09.2025-12.2025",
            "location": "Turku,Finland",
            "description": "• Built a Unity avatar system to help the VINCE team create and manage character presets efficiently for an immigrant integration -project.\n• Organized the avatar content into a modular setup using ScriptableObjects, supporting 20 components and ~30 preset combinations.\n• Created editor tools to streamline preset creation, reducing setup time from ~10 minutes to ~1 minute, with automatic sync/loading to a database.\nAchievement: Delivered a working avatar preset pipeline that enabled fast iteration and reliable database-ready outputs.",
        },
        {
            "id": 103,
            "role": "Founder & Software Engineering Development Manager",
            "company": "Shanghai Demu Network Co., Ltd.",
            "date": "2019 – 2024",
            "location": "Shanghai,China",
            "description": "• Contributed to 1000+ scanned/reconstructed artifacts for national-level and regional museums.\n• Produced ~50 online panoramic exhibitions and interactive showcase experiences, coordinating scope, schedule, QA, and client acceptance.\nAchievement: Owned end-to-end delivery (scope, schedule, QA, acceptance) across multiple museum clients.Led museum digitization projects from planning to delivery, including 3D scanning/reconstruction and interactive online showcases.",
        },
        {
            "id": 104,
            "role": "3D Environment Artist",
            "company": "Virtuos",
            "date": "2018 - 2019",
            "location": "Shanghai,China",
            "description": "• Worked in an AAA production pipeline on the Need for Speed project, producing environment assets and supporting integration workflows.\nAchievement: Delivered production-ready environment assets within an established AAA pipeline and collaboration process.",
        },
        {
            "id": 105,
            "role": "PanoramaAssistant → 3D Artist → Product Creative Team Leader",
            "company": "Shanghai Zhongxin Information Development Inc., Ltd.",
            "date": "2014-2018",
            "location": "Shanghai,China",
            "description": "• Delivered digital twin archive solutions for dozens of provincial/municipal institutions, combining 3D content production with real-world system.\n• Led coordination across requirements, scheduling, production, maintenance, and quality control within the team.\nAchievement: Helped clients adopt and maintain digital twin archive systems with stable delivery and clear coordination across multiple stakeholders.",
        },
    ],
    "education": [],
    "projects": [],
    "skills": [
        {"id": 201, "name": "AI Workflow", "items": "GitHub Copilot · Claude (Code) · Cursor· CodeX"},
        {"id": 202, "name": "Game Engines", "items": "Unity (primary), Unreal (basic)"},
        {"id": 203, "name": "Web / Mobile", "items": "C#,Python,React Native (Expo), Three.js,NodeJS,TypeScripts,Firebase"},
        {"id": 204, "name": "Workflow", "items": "GitHub, Jira, Cloud deployment (Tencent Cloud / Alibaba Cloud/Azure),CI/CD (GitHub Actions)"},
        {"id": 205, "name": "Graphic", "items": "Blender, Maya, ZBrush, Substance Painter, 3ds Max,Marmoset Toolbag"},
        {"id": 206, "name": "Creative", "items": "Lightroom · Photoshop · Premiere Pro · After Effects · Photo/Video editing"},
    ],
    "languages": [],
}


design = {
    "font": "default",
    "color": "#575EB7",
    "logo": data_url(TEMP / "extract-p1-1-X7.png", "image/png"),
    "logoPosition": "footer-right",
    "logoSize": 140,
    "logoOpacity": 18,
    "logoCoords": None,
    "showPageNumbers": False,
    "pageNumberPosition": "bottom-right",
    "spacing": 1,
    "bodySize": 11,
    "headingSize": 18,
    "subheadingSize": 14,
    "lineHeight": 1.35,
    "itemSpacing": 0.72,
    "sectionSpacing": 0.72,
    "headerSpacing": 0.82,
    "avatarSize": 96,
    "headerLayout": "split",
    "headerStyle": "clean",
    "avatarShape": "rounded",
    "layout": [{"id": "p1", "sections": ["summary", "experience", "skills"]}],
    "sectionPositions": {
        "skills": "sidebar",
        "education": "sidebar",
        "languages": "sidebar",
        "contact": "sidebar",
        "summary": "main",
        "experience": "main",
        "projects": "main",
    },
}


template = {
    "version": "1.0",
    "exportDate": datetime.now(timezone.utc).isoformat(),
    "source": "Reconstructed from CV_Zhou.pdf",
    "resume": resume,
    "design": design,
    "theme": "classic",
}

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(template, ensure_ascii=False, indent=2), encoding="utf-8")
print(OUTPUT)
