import random
import os
import time

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def get_grade(rank):
    if rank <= 40: return "1등급"
    elif rank <= 110: return "2등급"
    elif rank <= 230: return "3등급"
    elif rank <= 400: return "4등급"
    elif rank <= 600: return "5등급"
    elif rank <= 770: return "6등급"
    elif rank <= 890: return "7등급"
    elif rank <= 960: return "8등급"
    else: return "9등급"

def get_hp_bar(hp):
    bars = max(0, hp) // 10
    return "■" * bars + "□" * (10 - bars)

def random_event(hp, money, subjects, total_turns):
    clear_screen()
    print("\n" + "="*70)
    print(" ⚠️ [돌발 이벤트 발생!] ⚠️")
    print("-" * 70)
    
    event_type = random.randint(1, 3)
    if event_type == 1:
        print(" 😈 친구: '야, 오늘 PC방 각? 롤 5인팟 한 명 빈다!'")
        print(" [1] 콜! 스트레스나 풀자 (체력 +40, 전과목 30등 하락)")
        print(" [2] 미안, 난 대학 가야 해 (체력 -15, 용돈 +50원)")
        ans = input(" 선택: ").strip()
        if ans == '1':
            hp = min(100, hp + 40)
            for s in subjects: subjects[s] = min(1000, subjects[s] + 30)
            print("\n 🎮 펜타킬! 신나게 놀았습니다! (체력 +40, 전과목 30등 하락)")
        else:
            hp -= 15; money += 50
            print("\n 😤 꾹 참았습니다! 부모님이 대견해하십니다. (체력 -15, 용돈 +50원)")
            
    elif event_type == 2:
        print(" 🤒 환절기 감기 기운이 돕니다. 머리가 지끈거립니다...")
        print(" [1] 하루 푹 쉰다 (체력 +50, 1턴 즉시 소모)")
        print(" [2] 약 먹고 버틴다 (돈 -20, 체력 -20, 전과목 10등 하락)")
        ans = input(" 선택: ").strip()
        if ans == '1':
            hp = min(100, hp + 50)
            total_turns += 1
            print("\n 🛌 하루 종일 푹 잤습니다. 개운합니다! (체력 +50, 1턴 소모)")
        else:
            money = max(0, money - 20); hp -= 20
            for s in subjects: subjects[s] = min(1000, subjects[s] + 10)
            print("\n 🤕 비몽사몽 공부했습니다. 약값만 날렸네요. (돈 -20, 체력 -20, 전과목 하락)")
            
    else:
        print(" 🍀 길을 걷다 500원짜리 동전을 주웠습니다!")
        print(" [1] 내 주머니로 꿀꺽한다 (돈 +500, 전과목 20등 하락)")
        print(" [2] 불우이웃 돕기 성금함에 넣는다 (돈 +50, 전과목 15등 상승)")
        ans = input(" 선택: ").strip()
        if ans == '1':
            money += 500
            for s in subjects: subjects[s] = min(1000, subjects[s] + 20)
            print("\n 💰 횡재했다! 하지만 왠지 찜찜해서 집중이 안 됩니다. (돈 +500, 전과목 하락)")
        else:
            money += 50
            for s in subjects: subjects[s] = max(1, subjects[s] - 15)
            print("\n 👼 착한 일의 보답! 우연히 본 문제가 머리에 박힙니다. (돈 +50, 전과목 상승)")
            
    print("="*70)
    time.sleep(2.5)
    return hp, money, subjects, total_turns

def mock_exam(overall_rank, money):
    clear_screen()
    print("\n" + "📝"*20)
    print(" 🔔 [전국 연합 학력평가 성적표 배부] 🔔")
    print(f" 당신의 현재 종합 등수는 전국 {overall_rank}등 입니다.")
    print("-" * 40)
    
    if overall_rank <= 50:
        print(" 🎉 [전국구 에이스!] 학교의 자랑입니다! (장학금 +1000원)")
        money += 1000
    elif overall_rank <= 200:
        print(" 👏 [성적 우수] 명문대 합격 안정권입니다! (장학금 +400원)")
        money += 400
    elif overall_rank <= 500:
        print(" 😐 [평범] 조금 더 분발하세요. 할 수 있습니다! (장학금 +100원)")
        money += 100
    else:
        print(" 😡 [성적 경고] 부모님이 크게 실망하셨습니다. (용돈 200원 삭감!)")
        money = max(0, money - 200)
        
    print("📝"*20)
    input(" 확인 (Enter 키를 누르세요)")
    return money

def show_ending(subjects, hospital_count, total_turns):
    clear_screen()
    overall_rank = sum(subjects.values()) // 6
    print("\n" + "🎓"*20)
    print(f" ⏳ 수능 D-Day! 당신의 1년 수험 생활이 끝났습니다.")
    print(f" - 총 소요 턴: {total_turns}턴 | 🏥 응급실 입원: {hospital_count}회")
    print(f" - 최종 종합 등수: 전국 {overall_rank}등")
    print("-" * 40)
    
    time.sleep(1)
    
    # 엔딩 분기
    if hospital_count >= 3:
        print(" 🏥 [엔딩: 건강을 잃은 수험생]")
        print(" 성적도 중요하지만 건강이 최고입니다. 무리한 공부로 요양병원에 입원했습니다...")
    elif all(rank <= 10 for rank in subjects.values()):
        print(" 👑 [엔딩: 전설의 수능 만점자]")
        print(" 서울대 의예과 수석 합격! 뉴스 인터뷰: '교과서 위주로 충실히 공부했어요^^'")
    elif subjects["국어"] <= 50 and subjects["영어"] <= 50 and subjects["사회"] <= 50 and overall_rank <= 200:
        print(" 🏛️ [엔딩: 문과 황제]")
        print(" 압도적인 문과 성적으로 서울대 경영학과 수석 합격! 차기 로스쿨 수석 예약!")
    elif subjects["수학"] <= 50 and subjects["과학"] <= 50 and overall_rank <= 200:
        print(" 🔬 [엔딩: 이과 천재]")
        print(" 수학과 과학의 신! 카이스트 장학생으로 조기 입학! 랩실 노예 확정!")
    elif overall_rank <= 200:
        print(" 🏫 [엔딩: 인서울 명문대 합격]")
        print(" 성공적인 수험 생활! 원하는 인서울 명문대에 프리패스 합격했습니다!")
    elif overall_rank <= 500:
        print(" 🎒 [엔딩: 평범하고 즐거운 대학생]")
        print(" 무난하게 지거국에 합격하여 즐거운 MT와 미팅 등 대학 생활을 시작합니다.")
    else:
        print(" 📝 [엔딩: 다시 한번 도전! (4수생)]")
        print(" 대치동 재수 종합 학원 VIP 멤버로 등록되었습니다. 내년엔 꼭 성공합시다!")
        
    print("🎓"*20)
    input(" 게임 플레이를 마칩니다. (Enter 키를 누르세요)")

def start_game():
    subjects = {"국어": 1000, "수학": 1000, "영어": 1000, "한국사": 1000, "과학": 1000, "사회": 1000}
    money = 60
    total_turns = 0
    max_turns = 200 # 수능까지 남은 시간 (D-200)
    hp = 100
    hospital_count = 0
    
    drink_count = book_count = tutor_count = 0
    has_ginseng = has_phone = has_planner = has_headphone = False
    
    print("🔥 [K-고3: 수능 전국 수석 키우기 - 운명의 200일 편] 개막!")
    print(" - 수능까지 남은 시간: 200일 (200턴)")
    print(" - 40턴마다 전국 모의고사가 실시됩니다.")
    print(" - 돌발 이벤트와 다양한 멀티 엔딩이 당신을 기다립니다!")
    input(" Enter 키를 누르면 수험 생활이 시작됩니다...")

    while total_turns < max_turns:
        clear_screen()
        
        # 패시브 버프 계산
        buff_kor = subjects["국어"] <= 100
        buff_math = subjects["수학"] <= 100
        buff_eng = subjects["영어"] <= 100
        buff_hist = subjects["한국사"] <= 100
        buff_sci = subjects["과학"] <= 100
        buff_soc = subjects["사회"] <= 100
        
        discount = 0.8 if buff_eng else 1.0
        money_mult = 2 if buff_math else 1
        boost_mult = 1.5 if buff_kor else 1.0
        drink_eff = 10 if buff_sci else 5
        tutor_eff = 20 if buff_soc else 10
        
        # 확률 계산
        crit_chance = min(50, tutor_count * tutor_eff) 
        drop_chance = 0 if buff_hist else max(0, 15 - (book_count * 5))
        base_rise = 50 + (drink_count * drink_eff) + (10 if has_headphone else 0)
        rise_chance = min(100 - crit_chance - drop_chance, base_rise)
        maintain_chance = max(0, 100 - crit_chance - drop_chance - rise_chance)
        
        overall_rank = sum(subjects.values()) // 6
        
        # 게임 화면 출력
        print("=" * 90)
        hp_status = "안정" if hp > 50 else ("경고" if hp > 20 else "🔥번아웃🔥")
        print(f" ⏳ 남은 시간(D-Day): {max_turns - total_turns:3d}일 | 🏥 입원: {hospital_count}/3회")
        print(f" 🔋 현재 체력: [{get_hp_bar(hp)}] {hp}/100 ({hp_status})")
        print(f" 🏆 종합 등수: 전국 {overall_rank:4d}등 | 💰 장학금: {money:4d}원")
        print("-" * 90)
        
        subj_list = list(subjects.items())
        for i in range(0, 6, 2):
            s1, r1 = subj_list[i]; s2, r2 = subj_list[i+1]
            print(f" {i+1}. {s1}: {r1:4d}등({get_grade(r1)}) [{'ON' if r1<=100 else 'OFF'}]  |  {i+2}. {s2}: {r2:4d}등({get_grade(r2)}) [{'ON' if r2<=100 else 'OFF'}]")
            
        print("-" * 90)
        print(" [현재 나의 확률]   [🛒 소모품 & 휴식]             [🎒 영구 장비 & 특수]")
        print(f" 💥 대박: {crit_chance:3d}%    7. ☕ 드링크({int(50*discount):3d}원): 상승+   12. 💊 홍삼({int(120*discount):3d}원): 체력소모- [{'O' if has_ginseng else 'X'}]")
        print(f" 📈 상승: {rise_chance:3d}%    8. 📘 족보  ({int(150*discount):3d}원): 하락-   13. 📱 2G폰({int(250*discount):3d}원): 하락방어  [{'O' if has_phone else 'X'}]")
        print(f" ➖ 유지: {maintain_chance:3d}%    9. 👨‍🏫 과외  ({int(500*discount):3d}원): 대박+   14. ⏰ 플래너({int(350*discount):3d}원): 1+1공부   [{'O' if has_planner else 'X'}]")
        print(f" 📉 하락: {drop_chance:3d}%   10. 🛌 낮잠  (  0원): 체력+25 15. 🎧 노캔({int(600*discount):3d}원): 상승+10%  [{'O' if has_headphone else 'X'}]")
        print(f"                 11. 🍗 치킨  ({int(40*discount):3d}원): 체력+40 16. 🍵 총명탕({int(1000*discount):4d}원): 전과목-30")
        print("=" * 90)
        print("▶ 행동: [1~6] 과목 열공 | [7~16] 상점/휴식 | [Q] 수능 포기(종료)")
        
        action = input(" 입력: ").strip()
        
        if action.lower() == 'q':
            print(f"\n수능을 중도 포기합니다...")
            break
            
        # 상점/휴식
        if action.isdigit() and 7 <= int(action) <= 16:
            act_num = int(action)
            prices = {7:50, 8:150, 9:500, 10:0, 11:40, 12:120, 13:250, 14:350, 15:600, 16:1000}
            actual_price = int(prices[act_num] * discount)
            
            if money < actual_price:
                print("\n❌ 장학금이 부족합니다!")
                time.sleep(1); continue
                
            if act_num == 7: money -= actual_price; drink_count += 1; print("\n☕ 각성 상태에 진입합니다.")
            elif act_num == 8:
                if drop_chance <= 0: print("\n❌ 하락 확률이 이미 0%입니다."); time.sleep(1); continue
                money -= actual_price; book_count += 1; print("\n📘 시크릿 족보 획득!")
            elif act_num == 9: money -= actual_price; tutor_count += 1; print("\n👨‍🏫 일타강사 섭외 완료!")
            elif act_num == 10:
                total_turns += 1; hp = min(100, hp + 25); print("\n🛌 꿀잠 (체력 +25, 1턴 소모)")
                if total_turns % 40 == 0 and total_turns < max_turns:
                    time.sleep(1.2)
                    overall_rank = sum(subjects.values()) // 6
                    money = mock_exam(overall_rank, money)
                    continue
            elif act_num == 11: money -= actual_price; hp = min(100, hp + 40); print("\n🍗 치킨 먹방! (체력 +40)")
            elif act_num == 12:
                if has_ginseng: print("\n❌ 이미 복용중입니다."); time.sleep(1); continue
                money -= actual_price; has_ginseng = True; print("\n💊 홍삼 파워! 체력 소모 감소.")
            elif act_num == 13:
                if has_phone: print("\n❌ 이미 처분했습니다."); time.sleep(1); continue
                money -= actual_price; has_phone = True; print("\n📱 2G폰 장착! 딴짓 패널티 방어.")
            elif act_num == 14:
                if has_planner: print("\n❌ 이미 사용중입니다."); time.sleep(1); continue
                money -= actual_price; has_planner = True; print("\n⏰ 스터디 플래너 장착!")
            elif act_num == 15:
                if has_headphone: print("\n❌ 이미 장착했습니다."); time.sleep(1); continue
                money -= actual_price; has_headphone = True; print("\n🎧 노캔 헤드폰 장착! 상승확률 +10%p")
            elif act_num == 16:
                money -= actual_price; print("\n🍵 총명탕 발동! 전 과목 30등 상승!")
                for sub in subjects: subjects[sub] = max(1, subjects[sub] - 30)
                
            time.sleep(1.2)
            continue
            
        # 과목 공부
        elif action.isdigit() and 1 <= int(action) <= 6:
            target_subject = list(subjects.keys())[int(action)-1]
            
            if subjects[target_subject] <= 1:
                print(f"\n✨ {target_subject} 과목은 이미 완벽합니다!")
                time.sleep(1); continue
            
            if hp <= 20:
                print("\n⚠️ 번아웃 상태입니다...")
                if random.random() < 0.5:
                    print("💤 공부 도중 기절하듯 잠들었습니다! (턴 소모, 체력 +5)")
                    hp = min(100, hp + 5); total_turns += 1; time.sleep(1.5)
                    if total_turns % 40 == 0 and total_turns < max_turns:
                        overall_rank = sum(subjects.values()) // 6
                        money = mock_exam(overall_rank, money)
                    continue
                else:
                    efficiency = 0.5
            else:
                efficiency = 1.0
                
            total_turns += 1
            
            # 체력 소모 및 확률 적용
            base_hp = random.randint(10, 15)
            hp -= int(base_hp * 0.7) if has_ginseng else base_hp
            roll = random.randint(1, 100)
            
            if roll <= crit_chance:
                boost = int(random.randint(25, 55) * boost_mult * efficiency)
                subjects[target_subject] = max(1, subjects[target_subject] - boost)
                reward = int((120 + boost * 2) * money_mult)
                money += reward
                print(f"\n💥 [대박 터짐] {target_subject} {boost}등 상승! 💰 +{reward}원")
            elif roll <= crit_chance + rise_chance:
                boost = int(random.randint(6, 18) * boost_mult * efficiency)
                subjects[target_subject] = max(1, subjects[target_subject] - boost)
                reward = int((40 + boost) * money_mult)
                money += reward
                print(f"\n📈 {target_subject} {boost}등 상승. 💰 +{reward}원")
            elif roll > 100 - drop_chance:
                drop = random.randint(6, 12)
                drop = max(2, drop // 2) if has_phone else drop
                subjects[target_subject] = min(1000, subjects[target_subject] + drop)
                print(f"\n📉 집중력 저하... {target_subject} {drop}등 하락!")
            else:
                print(f"\n➖ 제자리걸음. 등수 유지.")

            if has_planner and random.random() < 0.3:
                other_sub = random.choice([s for s in subjects.keys() if s != target_subject])
                bonus = int(random.randint(3, 8) * boost_mult * efficiency)
                subjects[other_sub] = max(1, subjects[other_sub] - bonus)
                print(f"📅 [플래너 효과] {other_sub} {bonus}등 추가 상승!")

            # 🏥 체력 고갈 판정
            if hp <= 0:
                print("\n🚨 삐용삐용! 과로로 쓰러져 응급실로 실려갑니다!!")
                money = max(0, money - 200); hp = 60; total_turns += 3
                hospital_count += 1
                time.sleep(2)
                if hospital_count >= 3: break # 3번 쓰러지면 즉시 엔딩
                continue
            
            time.sleep(1.2)
            overall_rank = sum(subjects.values()) // 6
            
            # 📅 40턴 주기 모의고사
            if total_turns % 40 == 0 and total_turns < max_turns:
                money = mock_exam(overall_rank, money)
            # 🎲 15% 확률 돌발 이벤트 (모의고사 턴 제외)
            elif random.random() < 0.15 and total_turns < max_turns:
                hp, money, subjects, total_turns = random_event(hp, money, subjects, total_turns)
                if hp <= 0:
                    print("\n🚨 삐용삐용! 과로로 쓰러져 응급실로 실려갑니다!!")
                    money = max(0, money - 200); hp = 60; total_turns += 3
                    hospital_count += 1
                    time.sleep(2)
                    if hospital_count >= 3: break
                
        else:
            print("\n❌ 잘못된 입력입니다.")
            time.sleep(1)

    # 200턴 종료 (수능 디데이) 또는 게임 오버 시 엔딩 출력
    show_ending(subjects, hospital_count, total_turns)

if __name__ == "__main__":
    start_game()
