from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.app.core.security import get_password_hash
from backend.app.models.models import (
    User, TrafficReport, NeighborItem, NeighborLoan, NeighborAssistance,
    KhunjeDaoItem, LineLessProvider, LineLessQueue, LineLessToken,
    EasyAccessSpot, EasyAccessReview, ProbashiJob, ProbashiGuide,
    SkillCourse, WorkHubJob, Notification
)

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).filter(User.email == "yeamin@parabondhu.bd").first():
        return

    # 1. Users (Admin, Citizens, Verified Providers)
    users = [
        User(
            email="admin@parabondhu.bd",
            hashed_password=get_password_hash("Admin123!"),
            full_name="Yeamin Admin",
            phone="+8801711000001",
            role="admin",
            division="Dhaka",
            district="Dhaka",
            thana="Dhanmondi",
            is_verified=True,
            reputation_score=100,
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
        ),
        User(
            email="yeamin@parabondhu.bd",
            hashed_password=get_password_hash("Citizen123!"),
            full_name="Tanvir Yeamin",
            phone="+8801819223344",
            role="citizen",
            division="Dhaka",
            district="Dhaka",
            thana="Gulshan",
            is_verified=True,
            reputation_score=45,
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
        ),
        User(
            email="nusrat@parabondhu.bd",
            hashed_password=get_password_hash("Citizen123!"),
            full_name="Nusrat Jahan",
            phone="+8801911445566",
            role="citizen",
            division="Dhaka",
            district="Dhaka",
            thana="Uttara",
            is_verified=True,
            reputation_score=38,
            avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
        ),
        User(
            email="rahim@parabondhu.bd",
            hashed_password=get_password_hash("Citizen123!"),
            full_name="Rahim Chowdhury",
            phone="+8801611778899",
            role="citizen",
            division="Chattogram",
            district="Chattogram",
            thana="Agrabad",
            is_verified=True,
            reputation_score=29,
            avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
        ),
        User(
            email="dmch_provider@parabondhu.bd",
            hashed_password=get_password_hash("Provider123!"),
            full_name="DMCH OPD Desk Manager",
            phone="+8801511889900",
            role="provider",
            division="Dhaka",
            district="Dhaka",
            thana="Ramna",
            is_verified=True,
            reputation_score=85,
            avatar_url="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80"
        )
    ]
    db.add_all(users)
    db.commit()

    admin_u = users[0]
    tanvir_u = users[1]
    nusrat_u = users[2]
    rahim_u = users[3]
    provider_u = users[4]

    # 2. TrafficAlert Reports (clearly distinguish official vs community)
    traffic_reports = [
        TrafficReport(
            user_id=None,
            title="[Official Feed] Moghbazar Flyover Downramp Maintenance",
            description="Dhaka Metropolitan Police Traffic Division Notice: Maintenance work ongoing at the Eskaton descent of Moghbazar Flyover. Single lane traffic active.",
            category="road_closure",
            severity="high",
            latitude=23.7489,
            longitude=90.4048,
            location_name="Moghbazar Flyover (Eskaton End)",
            division="Dhaka",
            district="Dhaka",
            is_official=True,
            official_source="Dhaka Metropolitan Police (DMP) Traffic Division",
            upvotes_count=84,
            verified_count=32,
            status="active",
            suggested_alternative_route="Use Sonargaon Panthapath connector or Holy Family diversion road."
        ),
        TrafficReport(
            user_id=tanvir_u.id,
            title="[Demo Seed Data] Heavy Waterlogging after Rain near Bijoy Sarani",
            description="Knee-deep waterlogging on Rangs Bhaban crossing towards Airport road. CNGs and bikes stalling.",
            category="waterlogging",
            severity="severe",
            latitude=23.7663,
            longitude=90.3872,
            location_name="Bijoy Sarani Intersection, Tejgaon",
            division="Dhaka",
            district="Dhaka",
            is_official=False,
            upvotes_count=42,
            verified_count=19,
            status="active",
            suggested_alternative_route="Divert via Manik Mia Avenue -> Khamarbari -> Rokeya Sarani."
        ),
        TrafficReport(
            user_id=nusrat_u.id,
            title="[Demo Seed Data] Airport Road Slow Traffic due to Metro Pillar Inspection",
            description="Northbound lane from Kawla towards Airport Terminal 3 moving at 10 km/h.",
            category="congestion",
            severity="medium",
            latitude=23.8504,
            longitude=90.4074,
            location_name="Airport Road, Kawla, Dhaka",
            division="Dhaka",
            district="Dhaka",
            is_official=False,
            upvotes_count=15,
            verified_count=8,
            status="active",
            suggested_alternative_route="Take Dhaka Elevated Expressway entrance at Banani for express airport exit."
        ),
        TrafficReport(
            user_id=rahim_u.id,
            title="[Official Feed] GEC Circle Signal Overhaul & Construction",
            description="Chattogram City Traffic Advisory: GEC Circle undergoing new smart-signal cable laying. Intermittent lane blockages.",
            category="construction",
            severity="medium",
            latitude=22.3592,
            longitude=91.8217,
            location_name="GEC Circle, Chattogram",
            division="Chattogram",
            district="Chattogram",
            is_official=True,
            official_source="Chattogram Metropolitan Police Traffic Advisory",
            upvotes_count=29,
            verified_count=12,
            status="active",
            suggested_alternative_route="Bypass via Prabartak Circle or CDA Avenue."
        )
    ]
    db.add_all(traffic_reports)

    # 3. NeighborShare Items
    items = [
        NeighborItem(
            owner_id=tanvir_u.id,
            title="[Demo Seed Data] Bosch 13mm Impact Drill & Wall Plug Kit",
            description="High quality electric drill with masonry and wood bits. Perfect for hanging shelves, photo frames and small home DIY.",
            category="tools",
            condition="like_new",
            deposit_amount=500.0,
            rental_rate_type="free",
            max_days=3,
            location_name="Gulshan-1, Road 24",
            division="Dhaka",
            district="Dhaka",
            latitude=23.7780,
            longitude=90.4180,
            image_url="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
            status="available"
        ),
        NeighborItem(
            owner_id=nusrat_u.id,
            title="[Demo Seed Data] Philips Adult & Pediatric Compressor Nebulizer",
            description="Medical grade nebulizer machine for asthmatic distress or seasonal chest cold. Mask sets sanitized.",
            category="medical",
            condition="good",
            deposit_amount=0.0,
            rental_rate_type="free",
            max_days=5,
            location_name="Uttara Sector 7",
            division="Dhaka",
            district="Dhaka",
            latitude=23.8680,
            longitude=90.3980,
            image_url="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80",
            status="available"
        ),
        NeighborItem(
            owner_id=rahim_u.id,
            title="[Demo Seed Data] Portable Lightweight Folding Wheelchair",
            description="Comfortable foldable wheelchair, easy to keep in car trunk. Available for medical visits or elderly neighbors.",
            category="medical",
            condition="like_new",
            deposit_amount=1000.0,
            rental_rate_type="free",
            max_days=7,
            location_name="Agrabad C/A",
            division="Chattogram",
            district="Chattogram",
            latitude=22.3275,
            longitude=91.8123,
            image_url="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
            status="available"
        )
    ]
    db.add_all(items)

    # 4. Neighbor Assistance Requests
    assistances = [
        NeighborAssistance(
            author_id=nusrat_u.id,
            title="[Demo Seed Data] Urgent: Prescription Medicine Pickup for Elderly Mother",
            description="Need someone going towards Labaid Dhanmondi to pick up cardiac medications. Can reimburse via bKash instantly.",
            category="elderly_support",
            urgency="high",
            division="Dhaka",
            district="Dhaka",
            location_name="Dhanmondi Road 8/A",
            status="open"
        ),
        NeighborAssistance(
            author_id=tanvir_u.id,
            title="[Demo Seed Data] Jumpstart Car Battery with Jumper Cables",
            description="Car battery drained overnight near Gulshan Park. Need a quick 5-min jumpstart if someone has cables.",
            category="emergency_ride",
            urgency="normal",
            division="Dhaka",
            district="Dhaka",
            location_name="Gulshan 2 Lake Park area",
            status="open"
        )
    ]
    db.add_all(assistances)

    # 5. KhunjeDao (Lost and Found)
    khunje_items = [
        KhunjeDaoItem(
            reporter_id=tanvir_u.id,
            report_type="lost",
            item_type="nid_passport",
            title="[Demo Seed Data] Lost Brown Leather Wallet containing Smart NID & Driving License",
            description="Lost between Mirpur 10 roundabout and Farmgate bus stand. Contains Smart NID in name of 'Tanvir Yeamin', driving license, and Sonali Bank debit card.",
            primary_image_url="https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
            division="Dhaka",
            district="Dhaka",
            location_name="Mirpur 10 to Farmgate route",
            event_date=datetime.utcnow() - timedelta(days=1),
            latitude=23.7680,
            longitude=90.3880,
            brand_or_identifier="Brown leather with cross stitch, NID ending in ...9402",
            safe_handover_location="Tejgaon Model Thana or Mirpur 10 Metro Police Box",
            status="reported"
        ),
        KhunjeDaoItem(
            reporter_id=nusrat_u.id,
            report_type="found",
            item_type="wallet_bag",
            title="[Demo Seed Data] Found Brown Men's Leather Wallet near Farmgate Footover Bridge",
            description="Picked up a brown wallet dropped near Farmgate footover bridge stairs on Wednesday evening. Kept safely in hand.",
            primary_image_url="https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
            division="Dhaka",
            district="Dhaka",
            location_name="Farmgate Footover Bridge, Dhaka",
            event_date=datetime.utcnow() - timedelta(days=1),
            latitude=23.7570,
            longitude=90.3890,
            brand_or_identifier="Brown wallet containing government cards. Owner must verify name.",
            safe_handover_location="Tejgaon Police Station Desk",
            status="under_review"
        ),
        KhunjeDaoItem(
            reporter_id=rahim_u.id,
            report_type="found",
            item_type="phone",
            title="[Demo Seed Data] Found Samsung Galaxy Smartphone in CNG Auto-rickshaw",
            description="Passenger left Samsung phone in CNG auto-rickshaw traveling from Agrabad to GEC Circle. Lockscreen has photo of a child.",
            primary_image_url="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
            division="Chattogram",
            district="Chattogram",
            location_name="Agrabad to GEC Road",
            event_date=datetime.utcnow() - timedelta(days=2),
            latitude=22.3400,
            longitude=91.8150,
            brand_or_identifier="Samsung blue cover with cartoon sticker",
            safe_handover_location="Kotwali Police Thana Helpdesk, Chattogram",
            status="reported"
        )
    ]
    db.add_all(khunje_items)

    # 6. LineLess Providers & Queues
    providers = [
        LineLessProvider(
            owner_id=provider_u.id,
            name="[Demo Seed Data] Dhaka Medical College Hospital (DMCH) OPD",
            category="hospital",
            address="Secretariat Road, Ramna, Dhaka",
            division="Dhaka",
            district="Dhaka",
            latitude=23.7259,
            longitude=90.3976,
            phone="+880255165088",
            opening_time="08:00 AM",
            closing_time="02:30 PM",
            avg_service_time_mins=8,
            total_served_today=48,
            is_active=True
        ),
        LineLessProvider(
            owner_id=admin_u.id,
            name="[Demo Seed Data] Sonali Bank Corporate Branch Cash Counter",
            category="bank",
            address="Motijheel Commercial Area, Dhaka",
            division="Dhaka",
            district="Dhaka",
            latitude=23.7314,
            longitude=90.4172,
            phone="+88029555155",
            opening_time="10:00 AM",
            closing_time="04:00 PM",
            avg_service_time_mins=6,
            total_served_today=72,
            is_active=True
        ),
        LineLessProvider(
            owner_id=admin_u.id,
            name="[Demo Seed Data] Regional Passport Office - Agargaon",
            category="government_service",
            address="E-8/A Rokeya Sarani, Agargaon, Dhaka",
            division="Dhaka",
            district="Dhaka",
            latitude=23.7788,
            longitude=90.3755,
            phone="+88028181666",
            opening_time="09:00 AM",
            closing_time="05:00 PM",
            avg_service_time_mins=12,
            total_served_today=95,
            is_active=True
        )
    ]
    db.add_all(providers)
    db.commit()

    # Create queues
    q1 = LineLessQueue(
        provider_id=providers[0].id,
        name="General Medicine OPD Room 104",
        is_accepting_tokens=True,
        current_token_number=14,
        next_token_number=18,
        estimated_wait_per_token_mins=8
    )
    q2 = LineLessQueue(
        provider_id=providers[1].id,
        name="Cash Deposit & Remittance Counter 2",
        is_accepting_tokens=True,
        current_token_number=22,
        next_token_number=26,
        estimated_wait_per_token_mins=6
    )
    q3 = LineLessQueue(
        provider_id=providers[2].id,
        name="E-Passport Biometrics & Photo Booth 4",
        is_accepting_tokens=True,
        current_token_number=31,
        next_token_number=35,
        estimated_wait_per_token_mins=10
    )
    db.add_all([q1, q2, q3])
    db.commit()

    # Create sample tokens
    t1 = LineLessToken(
        queue_id=q1.id,
        user_id=tanvir_u.id,
        token_number=15,
        token_code="DMCH-015",
        status="waiting",
        estimated_call_time=datetime.utcnow() + timedelta(minutes=8),
        notes="Fever and routine checkup"
    )
    db.add(t1)

    # 7. EasyAccess Spots
    spots = [
        EasyAccessSpot(
            author_id=tanvir_u.id,
            title="[Demo Seed Data] Bangabandhu Military Museum & Plaza",
            category="park",
            address="Bijoy Sarani, Dhaka 1215",
            division="Dhaka",
            district="Dhaka",
            latitude=23.7656,
            longitude=90.3888,
            has_wheelchair_ramp=True,
            has_lift_elevator=True,
            has_accessible_toilet=True,
            has_wide_doors=True,
            has_tactile_paving=True,
            has_accessible_parking=True,
            overall_rating=4.9,
            verified_by_community=True,
            verification_count=18,
            notes="Excellent wheelchair accessibility throughout all gallery floors. Elevators spacious and ramps have gentle slope."
        ),
        EasyAccessSpot(
            author_id=nusrat_u.id,
            title="[Demo Seed Data] National Institute of Neurosciences & Hospital",
            category="hospital",
            address="Sher-E-Bangla Nagar, Agargaon, Dhaka",
            division="Dhaka",
            district="Dhaka",
            latitude=23.7758,
            longitude=90.3698,
            has_wheelchair_ramp=True,
            has_lift_elevator=True,
            has_accessible_toilet=True,
            has_wide_doors=True,
            has_tactile_paving=False,
            has_accessible_parking=True,
            overall_rating=4.6,
            verified_by_community=True,
            verification_count=14,
            notes="Dedicated wheelchair ramps at main entrance and emergency gate. Hospital attendants available with free loaner wheelchairs."
        ),
        EasyAccessSpot(
            author_id=rahim_u.id,
            title="[Demo Seed Data] Jamuna Future Park Mall (North Gate)",
            category="shopping_mall",
            address="Ka-244, Kuril, Progoti Shoroni, Dhaka",
            division="Dhaka",
            district="Dhaka",
            latitude=23.8135,
            longitude=90.4242,
            has_wheelchair_ramp=True,
            has_lift_elevator=True,
            has_accessible_toilet=True,
            has_wide_doors=True,
            has_tactile_paving=False,
            has_accessible_parking=True,
            overall_rating=4.5,
            verified_by_community=True,
            verification_count=9,
            notes="Step-free drop-off at North Gate basement 1 and ground level. Modern lifts reach all cinema and dining floors."
        )
    ]
    db.add_all(spots)
    db.commit()

    rev1 = EasyAccessReview(
        spot_id=spots[0].id,
        user_id=nusrat_u.id,
        rating=5,
        comment="Visited with grandfather who uses a wheelchair. Superb ramps and very respectful security guards.",
        ramp_ok=True,
        elevator_ok=True,
        toilet_ok=True
    )
    db.add(rev1)

    # 8. ProbashiConnect Overseas Jobs & Guides
    probashi_jobs = [
        ProbashiJob(
            publisher_id=admin_u.id,
            title="[Verified BMET Approved] Certified Staff Nurse (Geriatric / Hospital Care)",
            destination_country="United Kingdom (UK)",
            visa_type="Health and Care Worker Visa (Skilled)",
            sector="healthcare",
            required_skills="B.Sc in Nursing, Minimum 2 years clinical hospital experience, IELTS UKVI 6.5 or OET Grade B",
            salary_range="£26,000 - £31,000 / year (approx 3,700,000 - 4,400,000 BDT equivalent)",
            recruiter_agency="Bangladesh Overseas Employment and Services Limited (BOESL)",
            bmet_approval_no="BMET/GOV/UK/2026/0412",
            rl_license_no="RL-Govt-BOESL-001",
            is_verified_agency=True,
            source_type="official_bmet",
            cost_guidelines="Government-to-Government (G2G). Zero processing fee charged to candidate; visa fee sponsored by NHS trust.",
            warnings_against_brokers="WARNING: BOESL never employs private dalals or sub-agents. Official registration is exclusively through the Ami Probashi app and boesl.gov.bd."
        ),
        ProbashiJob(
            publisher_id=admin_u.id,
            title="[Verified BMET Approved] Industrial Electrician & PLC Maintenance Tech",
            destination_country="Japan",
            visa_type="Specified Skilled Worker (SSW-1)",
            sector="manufacturing",
            required_skills="Diploma in Electrical/Electronics, JFT-Basic or JLPT N4, Prometric Skills Exam passed",
            salary_range="210,000 - 260,000 JPY / month (approx 160,000 - 200,000 BDT equivalent)",
            recruiter_agency="Eastern Manpower Consortium Ltd (BMET Verified)",
            bmet_approval_no="BMET/VER/JPN/2026/089",
            rl_license_no="RL-1452",
            is_verified_agency=True,
            source_type="bmet_approved",
            cost_guidelines="Govt Maximum Migration Cost Ceiling: 140,000 BDT including medical, BMET smart card, and briefing.",
            warnings_against_brokers="Do not hand over your original passport or cash payments without a bank receipt and formal employment agreement in Japanese and Bangla."
        ),
        ProbashiJob(
            publisher_id=admin_u.id,
            title="[Verified Agency] Heavy Equipment & Mobile Crane Operator",
            destination_country="Qatar",
            visa_type="Work Permit Visa",
            sector="construction",
            required_skills="Valid Bangladesh Heavy Driving License, 3+ years crane operation experience, Basic English/Arabic",
            salary_range="2,800 - 3,500 QAR / month + Food & Accommodation provided (approx 90,000 - 112,000 BDT)",
            recruiter_agency="Al-Madina International Recruiting Agency",
            bmet_approval_no="BMET/REC/QAT/2026/220",
            rl_license_no="RL-0988",
            is_verified_agency=True,
            source_type="bmet_approved",
            cost_guidelines="Maximum legal BMET cost ceiling: 100,000 BDT. Employer provides air ticket.",
            warnings_against_brokers="Verify your demand letter and visa on the BMET smart card portal (bmet.gov.bd) before flight."
        )
    ]
    db.add_all(probashi_jobs)

    probashi_guides = [
        ProbashiGuide(
            country="Saudi Arabia & Gulf",
            category="rights_and_laws",
            title="Kafala System Reforms, Iqama Rights & Expatriate Protections",
            content="Know your rights under recent labor reforms: Under the Qiwa platform, expatriate workers can transfer sponsorship upon contract completion without sponsor approval. Always retain your passport; keeping employee passports is strictly illegal under Saudi Labor Law Article 143.",
            helpline_phone="Bangladesh Embassy Riyadh: +966-11-4195300 | Wage Earners Board: 16135",
            official_links="https://welfare.gov.bd, https://qiwa.sa"
        ),
        ProbashiGuide(
            country="General / Pre-Departure",
            category="visa_rules",
            title="Pre-Departure Checklist: BMET Smart Card, Fingerprint & Bank Account",
            content="Before departure from Hazrat Shahjalal International Airport, ensure you have: 1. BMET Smart Card (Emigration Clearance), 2. Attested Job Contract, 3. Non-Resident Taka Account (NRB Account) or Probashi Welfare Bank Account for 2.5% Remittance Incentive, 4. Mandatory 3-day pre-departure briefing completion certificate.",
            helpline_phone="Probashi Hotline (Toll-Free in BD): 16135 | From Abroad: +8809610102030",
            official_links="https://probashi.gov.bd"
        )
    ]
    db.add_all(probashi_guides)

    # 9. Skill Courses & WorkHub Jobs
    courses = [
        SkillCourse(
            title="[Demo Seed Data] Japanese Language N4 & JFT-Basic Crash Course",
            provider_name="Technical Training Centre (TTC) Dhaka & ParaBondhu Academy",
            category="language_prep",
            level="beginner",
            duration_weeks=12,
            is_free=True,
            price_bdt=0.0,
            certificate_provided=True,
            language="Bangla",
            enrollment_url="https://ttc.gov.bd",
            description="Comprehensive preparation course for Bangladeshi youths seeking SSW-1 technical jobs in Japan. Covers Hiragana, Katakana, 300 Kanji, and conversational listening."
        ),
        SkillCourse(
            title="[Demo Seed Data] Modern Full-Stack Web Development (React & Python)",
            provider_name="Bangladesh Computer Council (BCC) & BASIS Certified",
            category="it_coding",
            level="intermediate",
            duration_weeks=16,
            is_free=False,
            price_bdt=1500.0,
            certificate_provided=True,
            language="Bangla & English",
            enrollment_url="https://bcc.gov.bd",
            description="Hands-on software development program covering React, TypeScript, FastAPI, REST APIs, Git, and Docker. Geared toward local software firms and remote international freelance gigs."
        ),
        SkillCourse(
            title="[Demo Seed Data] Certified Caregiving & Elderly Patient Support",
            provider_name="National Skills Development Authority (NSDA)",
            category="nursing_caregiving",
            level="beginner",
            duration_weeks=8,
            is_free=True,
            price_bdt=0.0,
            certificate_provided=True,
            language="Bangla",
            enrollment_url="https://nsda.gov.bd",
            description="Government accredited caregiving skill training for high-demand elderly home-care and clinic positions in Bangladesh, Japan, and the UK."
        )
    ]
    db.add_all(courses)

    work_jobs = [
        WorkHubJob(
            employer_id=admin_u.id,
            title="[Demo Seed Data] Junior Frontend Engineer (React / TypeScript)",
            company_name="BondhuTech Solutions Ltd.",
            job_type="full_time",
            workplace_type="hybrid",
            location="Gulshan-2, Dhaka",
            salary_min=35000.0,
            salary_max=50000.0,
            skills_required="React, TypeScript, Tailwind CSS, REST APIs",
            experience_level="entry_level",
            description="We are seeking an energetic frontend developer to help build community-first software in Bangladesh. Health insurance, flexible hours, and festival bonuses provided.",
            is_verified=True
        ),
        WorkHubJob(
            employer_id=tanvir_u.id,
            title="[Demo Seed Data] Remote Digital Marketing & Community Specialist",
            company_name="Probashi Diaspora Media",
            job_type="part_time",
            workplace_type="remote",
            location="Remote (Bangladesh / Global)",
            salary_min=25000.0,
            salary_max=40000.0,
            skills_required="Social Media Management, Bangla Copywriting, Meta Ads, Community Engagement",
            experience_level="mid_level",
            description="Manage social channels and outreach campaigns for Bangladeshi expatriates across North America and Europe.",
            is_verified=True
        )
    ]
    db.add_all(work_jobs)

    # 10. Sample Notification
    notif = Notification(
        user_id=tanvir_u.id,
        title="Welcome to ParaBondhu (পাড়াবন্ধু)!",
        message="Your account is active. Connect with neighbors, monitor local traffic, and discover verified opportunities.",
        category="system",
        link_url="/"
    )
    db.add(notif)

    db.commit()
    print("Database successfully seeded with realistic Bangladesh data!")
