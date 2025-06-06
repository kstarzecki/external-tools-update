require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Canvas = require("@kth/canvas-api").default;
const canvas = new Canvas(process.env.CANVAS_API_URL, process.env.CANVAS_API_TOKEN);

const logFilePath = path.resolve(__dirname, "processed_courses.log");
const failedLogPath = path.resolve(__dirname, "failed_courses.log");

const policyModules = [
  {
    title: "Kursspecifik information om generativ AI",
    pages: [
      { title: "Hur du använder mallarna för kursspecifik information om generativ AI", indent: 0, body: `<p>Varje kurs på KTH ska ha kursspecifik information om generativ AI, i enlighet med beslut av Fakultetsrådet. Den kursspecifika informationen om generativ AI bör publiceras både på Canvas och i kurs-PM.</p><h2>Steg-för-steg guide till att skriva din kursspecifika information om generativ AI</h2><p>Denna modul kommer med flera förskapade mallar där varje mall representerar ett förhållningssätt till användning av generativ AI och ger förslag på information till studenterna. För att anpassa mallarna till din kurs behöver du gå igenom följande steg:</p><ul><li>Steg 0: Försäkra dig om att du är införstådd i relevanta riktlinjer och lagar om generativ AI.</li><li>Steg 1: Reflektera över lärandemålen och ditt pedagogiska upplägg.</li><li>Steg 2: Reflektera över effekten av att tillåta olika generativa AI-verktyg (om relevant).</li><li>Steg 3: Välj mall och anpassa efter din kurs.</li><li>Steg 4: Kontrollera innehållet och publicera.</li></ul><h3>Steg 0: Försäkra dig om att du är införstådd relevanta riktlinjer och lagar om generativ AI</h3><p>Kontrollera att du vet vad som gäller genom att läsa igenom följande:</p><ul><li><a class="inline_disabled" title="Länk" href="https://intra.kth.se/utbildning/systemstod/generativ-ai/ethical-issues-and-legal-matters-1.1253707" target="_blank" rel="noopener">Juridiska aspekter kring generativ AI (intra.kth.se)</a>.</li><li>Riktlinjerna på sidan <a class="inline_disabled" title="Länk" href="https://intra.kth.se/utbildning/systemstod/generativ-ai/riktlinjer-1.1405092" target="_blank" rel="noopener">Att tänka på vid användning av generativ AI (intra.kth.se)</a>.</li></ul><h3>Steg 1: Reflektera över lärandemålen och ditt pedagogiska upplägg</h3><p>Hur generativ AI används eller inte används bör stärka och stödja lärandemålen och de pedagogiska idéerna i din kurs. Fundera på om och hur generativ AI kan hjälpa studenternas lärande i din kurs och hur detta påverkar dina uppgifter och din undervisning. Basera ditt ställningstagande om generativ AI på dessa överväganden.</p><p><strong>Obs!</strong> Kom ihåg att begränsningar endast kan gälla examinerande moment i kursen, men det är bra att också ge en rekommendation för icke-examinerande moment.</p><p>Detta steg är viktigt eftersom du behöver kunna förklara ditt ställningstagande kring AI i kursen och studenter är mer benägna att följa regler de förstår. För fler tips om hur du kan hjälpa dina studenter, läs sidan <a class="inline_disabled" href="https://intra.kth.se/utbildning/systemstod/generativ-ai/talk-to-students-1.1374687" target="_blank" rel="noopener">Hur du pratar med dina studenter om generativ AI</a>.</p><h3>Steg 2: Reflektera över effekten av att tillåta olika generativa AI-verktyg</h3><p>Betalversioner av generativa AI-verktyg är vanligtvis mer avancerade än gratisversionerna eller har fler funktioner. Om du tillåter dina studenter att använda generativa AI-verktyg kan vissa av dem ha tillgång till en betalversion medan andra måste använda gratisversionen. Detta kan orsaka drastiskt olika upplevelser av hur användbar generativ AI är och kan gynna de som har betalversioner av verktyget. Du kan vilja begränsa vilka versioner som är tillåtna i kursens examinerande moment eller förse dina studenter med en betalversion, utan kostnad för studenterna.</p><p>Om användningen av generativ AI är förväntad eller obligatorisk måste du kunna ge studenterna tillgång till ett lämpligt verktyg utan kostnad för studenterna. Du rekommenderas också utbilda studenterna i hur de effektivt använder generativ AI.</p><p>Kom också ihåg att ha en plan för vad du ska göra om en student vägrar att använda generativ AI.</p><h3>Steg 3: Välj mall och anpassa efter din kurs</h3><p>De förskapade mallarna är breda då de är avsedda att hjälpa studenterna få en uppfattning av kursens förhållningssätt till användning av generativ AI. När du valt en mall så anpassar du den med de nödvändiga detaljerna så den uppfyller behoven i din kurs. Gå tillväga på följande vis:</p><ol><li>Välj en av de fyra mallarna:<ul><li>Ingen tillåten användning av generativ AI-verktyg.</li><li>Endast tillåten i specifika uppgifter.</li><li>Tillåtet i hela kursen efter givna riktlinjer.</li><li>Fri användning av generativ AI-verktyg.</li></ul></li><li>Redigera den valda mallen och skriv in de detaljer som krävs. Mallarna innehåller färgmarkerad text som är tänkt att guida dig till vad du behöver redigera.<ul><li>Var tydlig om vad som är tillåtet och otillåtet. Motivera gärna varför.</li></ul></li><li>Spara din kursspecifika information.</li></ol><h3>Steg 4: Kontrollera innehållet och publicera</h3><p>Till sist:</p><ol><li>Kontrollera att du raderat all färgmarkerad text i din valda mall.</li><li>Kontrollera att du fått med allting.</li><li>Publicera din kursspecifika information om generativ AI.</li><li>Avpublicera sidan “Kursansvarig har ännu inte specificerat information om generativ AI”.</li></ol><p><strong>Obs!</strong> Kom ihåg att även lägga in informationen i kurs-PM.</p><h2>Exempel på kursspecifik information om generativ AI</h2><p>Vi har samlat ett antal exempel på kursspecifik information om generativ AI som du kan inspireras av: <a class="inline_disabled" title="Länk" href="https://intra.kth.se/utbildning/systemstod/generativ-ai/exempel-kursspecifik-information-1.1405051" target="_blank" rel="noopener">Exempel på kursspecifik information om generativ AI (intra.kth.se)</a>.</p>` },
      { title: "Kursansvarig har ännu inte specificerat information om generativ AI", indent: 0, body: `<p>Kursansvarig för kursen har ännu inte specificerat information om generativ AI för kursen i Canvas. Kontrollera om denna information finns inlagd i kursens kurs-PM, annars kontaktar du ansvarig lärare och frågar vad som gäller angående användning av generativ AI i kursen.</p>` },
      { title: "Ingen tillåten användning av generativ AI-verktyg", indent: 1, body: `<p>All användning av generativ AI är förbjuden i kursens examinerande moment. Du rekommenderas även att undvika användningen av generativ AI vid dina egna studier och under lektionstid. Detta grundar sig i att användning av generativ AI anses ha en negativ inverkan på studenternas möjlighet att uppfylla kursens lärandemål. <span style="background-color: #f1c40f;">[Läraren motiverar kursens inställning till generativ AI utifrån hur användandet påverkar kursens lärandemål och/eller pedagogiska upplägg]</span></p><h2>Förbudet mot generativ AI innebär att&nbsp;</h2><ul><li>Alla examinerande moment måste utföras utan hjälp av generativ AI.</li><li>Alla inlämningar måste vara helt människoproducerade.</li></ul><p><strong>Du som student är fullt ansvarig</strong> för allt material du lämnar in och måste kunna försvara och förklara det helt utan stöd från generativ AI.</p><p>Studenter rekommenderas även undvika att använda generativ AI för stöd och handledning vid egen instudering, då svaren är opålitliga och kan utelämna viktiga delar av kursen. Ta i stället stöd av dina medstudenter och lärare för handledning och stöd, samt använd kurslitteraturen för fakta.</p><h2>Disciplinära åtgärder vid otillåten AI-användning</h2><p>Allt du lämnar in måste vara din egen prestation. Att använda generativ AI i kursens examinerande moment betraktas som <strong>otillåten hjälp och kan leda till disciplinära åtgärder</strong>.</p><h2>Frågor eller osäkerheter?</h2><p>Kontakta kursansvarig för vägledning och förtydligande av denna information, eller om du felaktigt anklagas för att ha använt generativ AI i kursens examinerande moment.</p>` },
      { title: "Endast tillåten i specifika uppgifter", indent: 1, body: `<p>I kursen tillåts användning av generativ AI i specifika examinerande uppgifter under tydligt givna förutsättningar och villkor baserade på uppgifternas karaktär. Användning av generativ AI är förbjuden i övriga examinerande moment och du rekommenderas även att undvika att använda generativ AI i icke-examinerande moment. Användningen av generativ AI för de utvalda uppgifterna anses främja lärandet och uppfyllandet av lärandemålen. <span style="background-color: #f1c40f;">[Läraren motiverar kursens inställning till generativ AI utifrån hur användandet påverkar kursens lärandemål och/eller pedagogiska upplägg]</span></p><h2>Tillåten användning av generativ AI</h2><p>I följande lista förklaras hur och i vilka examinerande uppgifter generativ AI får användas:</p><p><span style="background-color: #f1c40f;">[Lärare lägger in lista av uppgifter och kort beskrivning av hur generativ AI får användas för varje uppgift. Till exempel:</span></p><ul><li><span style="background-color: #f1c40f;">“Inlämningsuppgift A och D: brainstorming av idéer och upplägg på uppgiften, samt översättningar.</span><ul><li><span style="background-color: #f1c40f;">Restriktioner: Du får bara översätta meningar eller ord, inte hela stycken. Du måste arbeta vidare med idé-förslagen, du kan inte använda det genererade svaret rakt av.</span></li></ul></li><li><span style="background-color: #f1c40f;">Inlämningsuppgift E och presentation F: bildgenerering”]</span></li></ul><p>Ytterligare information ges i respektive uppgift.</p><p><strong>Obs!</strong> Kom ihåg att kritiskt granska material skapad av generativ AI. <strong>Du som student är fullt ansvarig</strong> för allt material du lämnar in och måste kunna försvara och förklara det helt utan stöd från generativ AI.</p><h3>Redovisning av AI-användning</h3><p>För att säkerställa akademisk transparens måste du redovisa om och hur generativ AI har använts i ditt arbete. Redovisningen ska göras på följande sätt: <span style="background-color: #f1c40f;">[Lärare lägger in hur generativ AI ska redovisas i studenternas arbete. Exempelvis “Bild skapad av AI-verktyg 1” eller “denna text har formaterats med AI-verktyg 2 med följande prompt:...”]</span></p><p><strong>Obs!</strong> AI-genererade referenser eller citat måste kontrolleras så de är korrekta och relevanta.</p><h2>Disciplinära åtgärder vid otillåten AI-användning</h2><p>Allt du lämnar in måste vara din egen prestation – även om generativ AI används som stöd måste tankegångarna och slutsatserna vara dina egna. Användning av generativ AI på ett otillåtet sätt för examinerande moment betraktas som försök till vilseledande och <strong>kan leda till disciplinära åtgärder</strong>. Var därför noga med att följa informationen på denna sida och det som specificerats i uppgifterna, samt redovisa din användning av generativ AI.</p><h2>Frågor eller osäkerheter?</h2><p>Kontakta kursansvarig för vägledning och förtydligande av denna information, eller om du felaktigt anklagas för otillåten användning av generativ AI i kursens examinerande moment.</p>` },
      { title: "Tillåtet i hela kursen efter givna riktlinjer", indent: 1, body: `<p>Generativa AI-verktyg får användas i alla examinerande moment och uppgifter så länge användningen följer kursens riktlinjer, om inget annat uttryckligen framgår. Du rekommenderas även att följa kursens riktlinjer för icke-examinerande moment och uppgifter. Riktlinjerna för användningen av generativ AI är utformade för att främja lärandet och uppfyllandet av kursens lärandemål. <span style="background-color: #f1c40f;">[Läraren motiverar kursens inställning till generativ AI utifrån hur användandet påverkar kursens lärandemål och/eller pedagogiska upplägg]</span></p><h2>Riktlinjer för användning av generativ AI</h2><p>Generativ AI får användas i kursens examinerande moment så länge du använder det på ett sätt som är:</p><ul><li>ansvarsfullt</li><li>etiskt</li><li>akademiskt hederligt.</li><li><span style="background-color: #f1c40f;">[Läraren lägger eventuellt till fler riktlinjer]</span></li></ul><p>Ett exempel på hur du uppfyller dessa riktlinjer är att vara transparent med din använding av generativ AI, vilket innebär att din användning måste redovisas. Du finner fler kursspecifika exempel under rubriken "Exempel på tillåten användning".</p><p>Notera återigen att riktlinjerna bara måste följas för examinerande moment, men för att främja ditt lärande rekommenderas du att även följa dem för icke-examinerande moment.</p><h3>Exempel på tillåten användning</h3><p>Här nedan ges exempel på tillåten användning av generativ AI i kursen. Rådfråga din lärare om du funderar på andra användningsområden.</p><p><span style="background-color: #f1c40f;">[Läraren fyller i exempel på acceptabel användning. Vid behov, skilj på krav för examinerande moment och rekommendationer för icke-examinerande moment. Exempel på tillåten användning:</span></p><ul><li><span style="background-color: #f1c40f;"><strong>Idégenerering:</strong> Använd AI för att få inspiration, strukturera tankar eller formulera frågor. Det är dock alltid bra att tänka självständigt först, så att inte AI-verktyget begränsar dina perspektiv.</span></li><li><span style="background-color: #f1c40f;"><strong>Tillåtet användningsområde 2:</strong> Förklaring av användningsområdet, gärna med exempel och tips.</span></li></ul><p><strong>Obs! </strong>Kom ihåg att kritiskt granska material skapad av generativ AI. <strong>Du som student är fullt ansvarig</strong> för allt material du lämnar in och måste kunna försvara och förklara det helt utan stöd från generativ AI.</p><h3>Exempel på otillåten användning</h3><p>Här nedan beskrivs några exempel på den användning av generativ AI i examinerande moment som räknas som otillåten hjälp, försök till vilseledande eller fusk. Detta är <strong>inte</strong> en komplett lista, rådfråga alltid din lärare om du är osäker på om din användning är tillåten.</p><p><span style="background-color: #f1c40f;">[Läraren listar otillåten användning. Vid behov, skilj på krav för examinerande moment och rekommendationer för icke-examinerande moment. Exempel på otillåten användning:</span></p><ul><li><span style="background-color: #f1c40f;"><strong>Fullständig uppgiftslösning:</strong> AI får inte användas för att generera hela inlämningsuppgifter, rapporter eller tentasvar.</span></li><li><span style="background-color: #f1c40f;"><strong>Otillåtet användningsområde 2:</strong> Förklaring av användningsområdet.</span></li></ul><h2>Redovisning av AI-användning</h2><p>För att säkerställa akademisk transparens måste du redovisa om och hur AI har använts i ditt arbete. Redovisningen ska göras på följande sätt: <span style="background-color: #f1c40f;">[Läraren lägger in hur generativ AI ska redovisas i studenternas arbete. Exempelvis "Bild skapad av AI-verktyg 1" eller "denna text har formaterats med AI-verktyg 2 med följande prompt:..."]</span></p><h2>Disciplinära åtgärder vid otillåten AI-användning</h2><p>Allt du lämnar in måste vara din egen prestation – även om generativ AI används som stöd måste tankegångarna och slutsatserna vara dina egna. Användning av generativ AI på ett otillåtet sätt i examinerande moment betraktas som försök till vilseledande och <strong>kan leda till disciplinära åtgärder</strong>. Var därför noga med att följa informationen på denna sida samt redovisa din användning av generativ AI.</p><h2>Frågor eller osäkerheter?</h2><p>Kontakta kursansvarig för vägledning och förtydligande av denna information, eller om du felaktigt anklagas för otillåten användning av generativ AI i kursens examinerande moment.</p>` },
      { title: "Fri användning av generativ AI-verktyg", indent: 1, body: `<p>I kursen får generativ AI användas efter studenternas eget tycke i alla examinerande moment och uppgifter, förutom om användandet bryter mot andra regler eller uppförandekoder. Användningen av generativ AI anses främja lärandet och uppfyllandet av kursens lärandemål. <span style="background-color: #f1c40f;"><span>Läraren motiverar kursens inställning till generativ AI utifrån hur användandet påverkar kursens lärandemål och/eller pedagogiska upplägg</span></span></p><h2>Tillåten användning av generativ AI</h2><p>Du som student får själv ta ställning till vad du anser vara etisk och studieförbättrande användning av generativ AI. Ditt ställningstagande behöver inkludera existerande regler och uppförandekoder på KTH samt vara juridiskt och etiskt försvarbar, exempelvis gällande hantering av personuppgifter eller upphovsrättsskyddat material. Gör medvetna val och håll dig uppdaterad angående relevanta lagar, domstolsbeslut och andra juridiska beslut kring AI och generativ AI.</p><p><span style="background-color: #f1c40f;">[Läraren lägger in hur studenterna ska få stöd att ta ställning, exempelvis genom att det diskuteras på lektionstid]</span></p><p><strong>Obs! </strong>Kom ihåg att kritiskt granska material skapad av generativ AI. <strong>Du som student är fullt ansvarig</strong> för allt material du lämnar in och måste kunna försvara och förklara det helt utan stöd från generativ AI.</p><h2>Redovisning av AI-användning</h2><p>Du som student avgör när och hur du behöver redovisa din användning av generativ AI.</p><h2>Frågor eller osäkerheter?</h2><p>Kontakta kursansvarig för vägledning och förtydligande av denna information.</p>` },
    ],
  },
  {
    title: "Course specific information about generative AI",
    pages: [
      { title: "How to use the templates for course specific information about generative AI", indent: 0, body: `<p>Each course at KTH shall have course specific information about generative AI, in accordance with the decision of the Faculty Council. This course specific information should be published both in Canvas and in the course memo.</p><h2>Step-by-step guide to writing your course specific information about generative AI</h2><p>This module comes with several pre-created templates, where each template represents an approach to the use of generative AI and give suggestions for information to students. To adapt the templates to your course, you need to go through the following steps:</p><ul><li>Step 0: Ensure that you understand the relevant guidelines and laws about generative AI.</li><li>Step 1: Reflect on the learning objectives and your pedagogical approach.</li><li>Step 2: Reflect on the impact of allowing different generative AI tools (if relevant).</li><li>Step 3: Choose a template and adapt it to your course.</li><li>Step 4: Check the content and publish.</li></ul><h3>Step 0: Make sure you understand the relevant guidelines and laws about generative AI</h3><p>Check that you know what applies by reading through the following:</p><ul><li><a class="inline_disabled" title="Länk" href="https://intra.kth.se/en/utbildning/systemstod/generativ-ai/ethical-issues-and-legal-matters-1.1253707" target="_blank" rel="noopener">Legal aspects of generative AI (intra.kth.se)</a>.</li><li>The guidelines on the page <a class="inline_disabled" title="Länk" href="https://intra.kth.se/en/utbildning/systemstod/generativ-ai/riktlinjer-1.1405092" target="_blank" rel="noopener">Considerations for using generative AI (intra.kth.se)</a>.</li></ul><h3>Step 1: Reflect on the learning objectives and your pedagogical approach</h3><p>How generative AI is used or not used should strengthen and support the learning objectives and pedagogical ideas in your course. Consider whether and how generative AI can help students learn in your course and how this affects your assignments and your teaching. Base your position to generative AI on these considerations.</p><p><strong>Note!</strong> Remember that restrictions can only apply to graded elements of the course, but it is good to also provide recommendations for non-graded elements.</p><p>This step is important as you need to be able to explain your position to generative AI in the course, and because students are more likely to follow rules they understand. For more tips on how to help your students, read the page <a class="inline_disabled" href="https://intra.kth.se/en/utbildning/systemstod/generativ-ai/talk-to-students-1.1374687" target="_blank" rel="noopener">How to talk to your students about generative AI</a>.</p><h3>Step 2: Reflect on the impact of allowing different generative AI tools</h3><p>Paid versions of generative AI tools are typically more advanced than the free versions or have more features. If you allow your students to use generative AI tools, some of them may have access to a paid version while others must use the free version. This can cause drastically different experiences of how useful generative AI is and may benefit those who have paid versions of the tool. You may want to limit which versions are allowed in the graded assignments and other examinations or provide your students with a paid version, at no cost to students.</p><p>If the use of generative AI is expected or required, you need to be able to provide your students access to an appropriate tool at no cost to students. We also recommend that you train your students on how to effectively use generative AI.</p><p>Also, remember to have a plan for what to do if a student refuses to use generative AI.</p><h3>Step 3: Choose a template and adapt it to your course</h3><p>The pre-created templates are broad as they are intended to help students get an idea of ​​the course's approach to the use of generative AI. Once you have chosen a template, customize it with the necessary details to meet the needs of your course. Follow these steps:</p><ol style="list-style-type: decimal;"><li>Choose one of the four templates:<ul style="list-style-type: circle;"><li>No use of generative AI tools allowed.</li><li>Allowed only in specific assignments.</li><li>Allowed throughout the course according to given guidelines.</li><li>Free use of generative AI tools.</li></ul></li><li>Edit the selected template and enter the required details. The templates contain highlighted text that is intended to guide you to what you need to edit.<ul style="list-style-type: circle;"><li>Be clear about what is allowed and what is not allowed. Please justify why.</li></ul></li><li>Save your course specific information.</li></ol><h3>Step 4: Check the content and publish</h3><p>Finally:</p><ol style="list-style-type: decimal;"><li>Check that you have deleted all the highlighted text in your chosen template.</li><li>Check that you have included everything.</li><li>Publish the course specific information about generative AI.</li><li>Unpublish the page “The course responsible has not yet specified information about generative AI”.</li></ol><p><strong>Note!</strong> Remember to also add the information to the course memo.</p><h2>Examples of course specific information about generative AI</h2><p>We have collected a number of examples of course specific information about generative AI that you can be inspired by: <a class="inline_disabled" title="Länk" href="https://intra.kth.se/en/utbildning/systemstod/generativ-ai/exempel-kursspecifik-information-1.1405051" target="_blank" rel="noopener">Examples of course-specific information about generative AI (intra.kth.se)</a>.</p>` },
      { title: "The course responsible has not yet specified information about generative AI", indent: 0, body: `<p>The course responsible has not yet specified information about generative AI for the course in Canvas. Check if the information is included in the course memo, otherwise contact the instructor and ask what applies regarding the use of generative AI in the course.</p>` },
      { title: "No use of generative AI tools allowed", indent: 1, body: `<p>All use of generative AI is prohibited in the course's examination and graded assignments. You are also advised to avoid the use of generative AI in your own studies and during class time. This is based on the fact that the use of generative AI is considered to have a negative impact on students' ability to meet the course's learning objectives. <span style="background-color:#f1c40f;">[The teacher justifies the course's approach to generative AI based on how its use affects the course's learning objectives and/or pedagogical approach.]</span></p><h2>The ban on generative AI means that</h2><ul><li>All examination and graded assignments must be carried out without the help of generative AI.</li><li>All submissions must be completely human-generated.</li></ul><p><strong>You as a student are fully responsible </strong>for all material you submit and must be able to defend and explain it completely without the support of generative AI.</p><p>Students are also advised to avoid using generative AI for support and guidance during their own study, as the answers are unreliable and may omit important parts of the course. Instead, seek support from your fellow students and teachers for guidance and support, and use the course literature for facts.</p><h2>Disciplinary action for unauthorized use of AI</h2><p>Everything you submit must be your own work. Using generative AI in the course's examination and graded assignments is considered <strong>unauthorized assistance and may result in disciplinary action</strong>.</p><h2>Questions or concerns?</h2><p>Contact the course responsible for guidance and clarification of this information, or if you are wrongly accused of using generative AI in the course's examination and graded assignments.</p>` },
      { title: "Allowed only in specific assignments", indent: 1, body: `<p>The course allows the use of generative AI in specific graded assignments under clearly stated conditions and terms based on the nature of the assignments. The use of generative AI is prohibited in other graded assignments and examinations and you are also advised to avoid using generative AI in non-graded assignments. The use of generative AI for the selected assignments is considered to promote learning and the fulfillment of the learning objectives. <span style="background-color:#f1c40f;">[The teacher justifies the course's approach to generative AI based on how its use affects the course's learning objectives and/or pedagogical approach.]</span></p><h2>Permitted use of generative AI</h2><p>The following list explains how and in which graded assignments generative AI may be used:</p><p><span style="background-color:#f1c40f;">[Teacher inserts a list of assignments and a short description of how generative AI may be used for each assignment. For example:</span></p><ul><li><span style="background-color:#f1c40f;">“Assignment A and D: brainstorming ideas and structure for the assignment, as well as translations.</span><ul><li><span style="background-color:#f1c40f;">Restrictions: You may only translate sentences or words, not entire paragraphs. You must work further with the idea suggestions, you cannot use the generated answer directly.</span></li></ul></li><li><span style="background-color:#f1c40f;">Assignment E and presentation F: image generation”]</span></li></ul><p>More information can be found in the respective assignment.</p><p><strong>Note!</strong> Remember to critically review material created by generative AI. <strong>You as a student are fully responsible</strong> for all material you submit and must be able to defend and explain it completely without support from generative AI.</p><h3>Disclosure of AI use</h3><p>To ensure academic transparency, you must disclose whether and how generative AI has been used in your work. The disclosure should be made as follows: <span style="background-color:#f1c40f;">[The teacher specifies how generative AI use should be reported in the students’ work. For example: “Image created using AI tool 1” or “This text has been formatted using AI tool 2 with the following prompt:...”]</span></p><p><strong>Note!</strong> AI-generated references or quotes must be checked for accuracy and relevance.</p><h2>Disciplinary action for unauthorized use of AI</h2><p>Everything you submit must be your own work – even if generative AI is used as support, the thinking and conclusions must be your own. Using generative AI in an unauthorized way for examination and graded assignments is considered an attempt to mislead and <strong>may lead to disciplinary action</strong>. Therefore, be sure to follow the information on this page and what is specified in the assignments, and disclose your use of generative AI.</p><h2>Questions or concerns?</h2><p>Contact the course responsible for guidance and clarification of this information, or if you are wrongly accused of unauthorized use of generative AI in the course's examination and graded assignments.</p>` },
      { title: "Allowed throughout the course according to given guidelines", indent: 1, body: `<p>Generative AI tools may be used in all examination and graded assignments as long as the use follows the course guidelines, unless otherwise explicitly stated. You are also advised to follow the course guidelines for non-graded assignments. The guidelines for the use of generative AI are designed to promote learning and the fulfillment of the course learning objectives. <span style="background-color:#f1c40f;">[The teacher justifies the course's approach to generative AI based on how its use affects the course's learning objectives and/or pedagogical approach.]</span></p><h2>Guidelines for the use of generative AI</h2><p>Generative AI may be used in the course's examination and graded assignments as long as you use it in a manner that is</p><ul><li>responsible</li><li>ethical</li><li>academically honest.</li><li><span style="background-color:#f1c40f;">[The teacher adds any additional guidelines]</span></li></ul><p>One example on how to fulfill these guidelines is to be transparent with your use of generative AI, which means that your use must be disclosed. You will find more course-specific examples under the heading "Examples of permitted use".</p><p>Note that the guidelines must be followed for examination and graded assignments, but you are advised to also follow them outside of examinations and for non-graded assignments.</p><h3>Examples of permitted use</h3><p>Below are examples of permitted use of generative AI in the course. Consult your teacher if you are considering other areas of use.</p><p><span style="background-color:#f1c40f;">[The teacher fills in examples of acceptable use. If necessary, distinguish between requirements for exam elements and recommendations for non-exam elements. Examples of permitted use:</span></p><ul><li><span style="background-color:#f1c40f;"><strong>Idea generation:</strong> Use AI to get inspiration, structure thoughts or formulate questions. However, it is always good to think independently first, so that the AI tool does not limit your perspectives].</span></li><li><span style="background-color:#f1c40f;"><strong>Permitted area of use 2:</strong> Explanation of the area of use, preferably with examples and tips.]</span></li></ul><p><strong>Note!</strong> Remember to critically review material created by generative AI. <strong>You as a student are fully responsible</strong> for all material you submit and must be able to defend and explain it completely without support from generative AI.</p><h3>Examples of prohibited use</h3><p>Below is a description of the use of generative AI in examination and graded assignments that is considered unauthorized assistance, attempted deception or cheating. This is <strong>not</strong> a complete list, always consult your teacher if you are unsure whether your use is permitted.</p><p><span style="background-color:#f1c40f;">[The teacher lists unauthorized use. If necessary, distinguish between requirements for exam elements and recommendations for non-exam elements. Examples of prohibited uses:</span></p><ul><li><span style="background-color:#f1c40f;"><strong>Complete assignment solution:</strong> AI may not be used to generate entire assignments, reports, or exam answers.</span></li><li><span style="background-color:#f1c40f;"><strong>Prohibited area of use 2:</strong> Explanation of the area of use.]</span></li></ul><h2>Disclosure of AI use</h2><p>To ensure academic transparency, you must disclose whether and how generative AI has been used in your work. The disclosure should be made as follows: <span style="background-color:#f1c40f;">[The teacher specifies how generative AI use should be reported in the students’ work. For example: “Image created using AI tool 1” or “This text has been formatted using AI tool 2 with the following prompt:...”]</span></p><h2>Disciplinary action for unauthorized use of AI</h2><p>Everything you submit must be your own work – even if generative AI is used as support, the thinking and conclusions must be your own. Using generative AI in an unauthorized way for examination and graded assignments is considered an attempt to mislead and <strong>may lead to disciplinary action</strong>. Therefore, be sure to follow the information on this page, and disclose your use of generative AI.</p><h2>Questions or concerns?</h2><p>Contact the course responsible for guidance and clarification of this information, or if you are wrongly accused of unauthorized use of generative AI in the course's examination and graded assignments.</p>` },
      { title: "Free use of generative AI tools", indent: 1, body: `<p>In the course, generative AI may be used at the students' own discretion in all examination and graded assignments, unless the use violates other rules or codes of conduct. The use of generative AI is considered to promote learning and the fulfillment of the course's learning objectives. <span style="background-color:#f1c40f;">[The teacher justifies the course's approach to generative AI based on how its use affects the course's learning objectives and/or pedagogical approach.]</span></p><h2>Permitted use of generative AI</h2><p>You as a student should decide for yourself how to use generative AI in a way that is ethical and promotes learning. Your decision must consider existing rules and codes of conducts at KTH, and it must be legally and ethically defensible, for example regarding the handling of personal data or copyrighted material. Make informed choices and stay up-to-date on relevant laws, court decisions, and other legal decisions surrounding AI and generative AI.</p><p><span style="background-color:#f1c40f;">[The teacher adds how the students will get support in making their decision, for example by discussing it during class time]</span></p><p><strong>Note! </strong>Remember to critically review material created by generative AI. <strong>You as a student are fully responsible</strong> for all material you submit and must be able to defend and explain it completely without support from generative AI.</p><h2>Disclosure of AI use</h2><p>You as a student decide when and how you need to disclose your use of generative AI.</p><h2>Questions or concerns?</h2><p>Contact the course responsible for guidance and clarification of this information.</p>` },
    ],
  },
];

const sisTermIds = ["20232"]; //2023 HT
const specificCourseIds = [];

function getProcessedCourses() {
  if (!fs.existsSync(logFilePath)) return new Set();
  const lines = fs
    .readFileSync(logFilePath, "utf-8")
    .split("\n")
    .filter(Boolean);
  return new Set(lines.map((id) => id.trim()));
}

function logProcessedCourse(courseId) {
  fs.appendFileSync(logFilePath, `${courseId}\n`);
}

function logFailedCourse(courseId) {
  fs.appendFileSync(failedLogPath, `${courseId}\n`);
}

async function addPolicyModulesToCourse(courseId) {
  try {
    for (const moduleDef of policyModules) {
      const createdPages = [];

      for (const page of moduleDef.pages) {
        const body = page.body;
        if (!body) {
          console.warn(`⚠️  No content for page "${page.title}" – skipping.`);
          continue;
        }

        const createdPage = await canvas.request(
          `courses/${courseId}/pages`,
          "POST",
          {
            wiki_page: {
              title: page.title,
              body,
              published: false,
            },
          }
        );

        createdPages.push({ ...createdPage.body, indent: page.indent ?? 0 });
      }

      const createdModule = await canvas.request(
        `courses/${courseId}/modules`,
        "POST",
        {
          module: {
            name: moduleDef.title,
            published: false,
          },
        }
      );

      for (const page of createdPages) {
        await canvas.request(
          `courses/${courseId}/modules/${createdModule.body.id}/items`,
          "POST",
          {
            module_item: {
              type: "Page",
              page_url: page.url,
              published: false,
              indent: page.indent ?? 0,
            },
          }
        );
      }
    }

    logProcessedCourse(courseId);
  } catch (error) {
    console.error(`❌ Error in course ID ${courseId}:`, error.message);
    logFailedCourse(courseId);
  }
}

async function resolveNumericTermIds(sisTermIds) {
  const numericIds = [];

  for (const sisId of sisTermIds) {
    console.log(`🔎 Resolving numeric term ID for SIS term "${sisId}"…`);
    try {
      // Use canvas.get(...) rather than canvas.request for this endpoint
      const resp = await canvas.get(`accounts/1/terms/sis_term_id:${sisId}`);
      const term = resp.body;
      numericIds.push(term.id);
      console.log(`✅ SIS term ${sisId} → numeric term ${term.id}`);
    } catch (e) {
      console.error(`⚠️ Could not resolve SIS term ${sisId}:`, e.message);
    }
  }

  return numericIds;
}

/**
 * Fetch all courses for each numeric term ID and print each course.id.
 * Returns the array of distinct course IDs.
 */
async function getCoursesFromTerms(termIds) {
  const allCourseIds = new Set();

  for (const termId of termIds) {
    console.log(`\n🔎 Fetching courses for numeric term ID: ${termId}…`);

    let fetchedCount = 0;

    // listItems on "accounts/1/courses" with enrollment_term_id
    for await (const course of canvas.listItems("accounts/1/courses", {
      enrollment_term_id: termId,
      per_page: 100,
    })) {
      fetchedCount++;
      allCourseIds.add(course.id);
      console.log(course.id); // print the actual course ID
    }

    console.log(`✅ Fetched ${fetchedCount} total courses for term ${termId}.\n`);
  }

  return Array.from(allCourseIds);
}

async function start() {
  const alreadyProcessed = getProcessedCourses();

  let courseIds = [];
  if (sisTermIds.length > 0) {
    // 1. Resolve SIS → numeric
    const numericTermIds = await resolveNumericTermIds(sisTermIds);

    // 2. Fetch + print all course IDs under each numeric term
    courseIds = await getCoursesFromTerms(numericTermIds);
  } else if (specificCourseIds.length > 0) {
    courseIds = specificCourseIds;
  }

  // Filter out those we've already processed
  const filtered = courseIds.filter(
    (id) => !alreadyProcessed.has(String(id))
  );
  if (filtered.length === 0) {
    console.log("No unprocessed course IDs remaining.");
    return;
  }

  console.log(`\n🚀 Processing ${filtered.length} course(s)…\n`);
  let count = 0;
  for (const id of filtered) {
    await addPolicyModulesToCourse(id);
    count++;
    process.stdout.write(".");
    if (count % 20 === 0) {
      process.stdout.write(` ${count} processed (last: ${id})\n`);
    }
  }
  console.log(`\n\n✅ Done processing ${count} course(s).`);
}

start().catch((err) => {
  console.error("Unexpected error:", err);
});