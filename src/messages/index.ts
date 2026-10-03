import type { Locale } from "@/lib/types"

const messages = {
  ar: {
    brand: "fly.sy",
    meta: {
      title: "fly.sy — كيف تصل إلى سوريا",
      description: "كل طريق إلى سوريا، مع مصدر كل معلومة وتاريخ مراجعتها. موقع مستقل غير رسمي.",
      // Alt text for the share card, which carries the same words as an image.
      card: "fly.sy — كيف تصل إلى سوريا. كل طريق، ومصدر كل معلومة، وتاريخ مراجعتها. مستقل، غير رسمي.",
    },
    tabs: { plan: "رحلتي", airlines: "الطيران", crossings: "المعابر", news: "الأخبار", reports: "تجارب", links: "روابط رسمية", about: "عن الموقع" },
    // The navigation's own short labels. Breadcrumbs and footer links keep the fuller names in `tabs`.
    nav: {
      label: "القائمة الرئيسية",
      trip: "رحلتي",
      flights: "الطيران",
      borders: "المعابر",
      papers: "الأوراق",
      news: "الأخبار",
      experiences: "تجارب",
      links: "روابط",
      // The phone's tab bar has seven cells of about 51px; a label wider than that gets an ellipsis. Shorter words for it.
      short: { experiences: "تجارب" },
      search: "ابحث",
      searchHint: "ابحث عن بلد أو مطار أو معبر أو شركة",
      searchEmpty: "لا نتائج. جرّب اسم بلد أو مدينة.",
      searchLoading: "جارٍ التحميل…",
      groups: { countries: "من بلد إلى دمشق", airports: "المطارات", crossings: "المعابر البرية", airlines: "شركات الطيران", pages: "صفحات" },
      toDamascus: "إلى دمشق",
    },
    indep: "موقع مستقل، غير رسمي، لا يتبع أي جهة حكومية ولا يمثّل أي شركة طيران أو سفارة. يُحدَّث يدوياً ومن تجارب الناس.",
    updated: "آخر تحديث",
    ask: { in: "أنا في", with: "ومعي", to: "وأريد الوصول إلى", via: "برحلة موصولة", fromLabel: "من", toLabel: "إلى", passportLabel: "جوازي" },
    way: {
      thenRoad: "{entry} ثم براً",
      fastest: "الأسرع",
      flights: "الرحلات: {n}",
      from: "من {cities}",
      flyLeg: "طيران {time}",
      roadLeg: "{time} بالسيارة إلى {city}",
      borderLeg: "{time} حتى المعبر",
      syriansOnly: "للسوريين والأتراك فقط",
      noTime: "لا وقت معروف",
      board: "الرحلات إلى {entry}",
      boardLand: "الطرق عبر {entry}",
      more: "الطرق الأخرى",
      open: "افتح",
    },
    regions: { near: "جوار سوريا", gulf: "الخليج", europe: "أوروبا", other: "أماكن أخرى" },
    status: { open: "يعمل", caution: "بشروط", closed: "مغلق", unknown: "غير معروف" },
    confidence: { verified: "متحقق", reported: "من تقارير", unconfirmed: "غير متحقق" },
    mode: { air: "طيران", land: "براً" },
    checked: "روجع",
    source: "المصدر",
    routes: "الطرق المتاحة",
    routesEmpty: "لا نعرف طريقاً من هنا. إن كنت تعرف واحداً، أخبرنا.",
    estimates: "الأزمنة تقديرية وتشمل عادةً انتظار المعبر",
    road: "الطريق البري",
    to: "إلى",
    need: "ما تحتاجه على هذا الطريق",
    blocked: "غير متاح لهذا الجواز",
    blockedWhy: "مفتوح للسوريين والأتراك وحاملي الجنسيتين فقط.",
    fromCity: "من",
    home: "الرئيسية",
    homeTitle: "كيف تصل إلى سوريا اليوم",
    langSwitch: "Read in English",
    airlines: {
      title: "من يطير إلى سوريا",
      lede: "كل شركة طيران تهبط اليوم في دمشق أو حلب أو دير الزور، ومن أين، وكم تستغرق الرحلة، ومدى ثقتنا بالمعلومة.",
      empty: "لا خطوط معروفة.",
      routes: "الخطوط إلى سوريا",
      country: "دولة الشركة",
      more: "شركات أخرى تطير إلى سوريا",
    },
    crossings: {
      title: "المعابر البرّية",
      lede: "حالة كل معبر بري إلى سوريا اليوم: من لبنان والأردن وتركيا والعراق. مفتوح أم مغلق، ومن يُسمح له بالعبور، ومصدر كل سطر.",
      airports: "المطارات",
      airportsLede: "المطارات السورية وحالة كل منها اليوم: من يعمل، ومن يهبط فيه، ومتى روجعت المعلومة.",
      more: "معابر أخرى",
    },
    entry: {
      via: "الطرق عبر",
      viaEmpty: "لا نعرف طريقاً يمر من هنا حالياً.",
      roads: "الطريق البري من هنا إلى المدن",
      roadsNote: "تقديرات fly.sy بالساعات، دون انتظار المعبر.",
      reports: "تجارب من هنا",
      reportsEmpty: "لا تجارب منشورة من هنا بعد.",
      need: "ما تحتاجه للعبور من هنا",
      plan: "خطّط رحلتك عبر هذا المنفذ",
      from: "من",
    },
    route: {
      title: "من {origin} إلى {city}",
      lede: "كل طريق نعرفه من {origin} إلى {city}، مرتباً حسب الوقت الكلي. اختر جوازك لترى ما ينطبق عليك. كل سطر بمصدره وتاريخ مراجعته.",
      answer: "أسرع طريق من {origin} إلى {city} اليوم: {how}، نحو {hours} من الباب إلى الباب (روجع في {date}). عدد الطرق المعروفة {total}، يعمل منها {running}.",
      answerNone: "لا نعرف اليوم طريقاً يعمل من {origin} إلى {city} بهذا الجواز. عدد الطرق المعروفة {total}.",
      how: { air: "الطيران إلى {entry}", land: "براً عبر {entry}" },
      list: "الطرق من {origin} إلى {city}",
      passports: "الجواز يغيّر الجواب",
      otherDest: "وجهات أخرى من {origin}",
      otherOrigin: "إلى {city} من دول أخرى",
      entries: "المنافذ على هذا الطريق",
    },
    // The partner agency (src/lib/partner.ts). Every place it appears says whose family runs it.
    partner: {
      tag: "شريك",
      title: "تحتاج مساعدة في الحجز؟",
      text: "نتعامل مع وكالة السفر {name} ونوصي بها. راسلهم على واتساب واسألهم عن هذه الرحلة.",
      cta: "{name} على واتساب",
      fine: "وكالة {name} تديرها عائلة مؤسس fly.sy. تحجز معها لا مع fly.sy، والطرق هنا تُعرض وتُرتَّب بالطريقة نفسها بوجودها أو بدونها.",
      // Typed into the chat for the traveller, who can change it before sending.
      message: "مرحباً، وصلت إليكم عن طريق fly.sy. أريد السفر من {origin} إلى {city}.",
      faq: {
        q: "هل يتعامل fly.sy مع وكالة سفر؟",
        a: "مع وكالة واحدة هي {name}، وتديرها عائلة مؤسس fly.sy. تظهر في بعض صفحات الطرق في بطاقة عليها كلمة «شريك». تحجز معها لا مع fly.sy، والطرق تُعرض وتُرتَّب بالطريقة نفسها بوجودها أو بدونها.",
      },
    },
    documents: {
      title: "الأوراق المطلوبة لدخول سوريا",
      lede: "ما تحتاجه حسب طريقة الدخول وجوازك. كل سطر بمصدره، وحيث لا مصدر موثوق نقول ذلك بدل التخمين.",
      air: "الدخول جواً",
      land: "الدخول براً",
      which: "أي جواز معك؟",
      warn: "تحقق مع السفارة أو شركة الطيران قبل شراء تذكرة غير قابلة للاسترداد. القواعد تتغير وتُطبَّق بشكل مختلف من موظف لآخر.",
    },
    news: {
      title: "أخبار الطريق إلى سوريا",
      lede: "ما تغيّر في المطارات والمعابر والرحلات والأوراق، بتاريخه ومصدره. ننقل كل خبر عن الجهة الرسمية أو عن الشركة نفسها، ونحدّث بيانات الموقع معه.",
      related: "ذو صلة",
      empty: "لا أخبار بعد.",
    },
    links: {
      title: "الروابط الرسمية للسفر إلى سوريا",
      lede: "المواقع والحسابات الرسمية لمطارات دمشق وحلب ودير الزور وهيئة الطيران المدني وشركات الطيران السورية ووزارة الخارجية والمعابر، وأدوات تعرف بها إن كان جوازك يحتاج تأشيرة.",
      how: "نتحقق من كل رابط بأنفسنا، وتُظهر كل بطاقة تاريخ التحقق. لا نُدرج حساباً إلا إذا أحال إليه الموقع الرسمي للجهة نفسها؛ ولم نجد لهيئة المنافذ موقعاً، فأدرجنا قناتها على تيليغرام التي نعتمدها مصدراً لأخبار المعابر.",
      warn: "تطلب المطارات من المسافرين متابعة الحسابات الرسمية فقط. قبل أن تدفع أو ترسل وثيقة، تأكد أن العنوان يطابق ما هنا.",
      jump: "أقسام الصفحة",
      groups: {
        aviation: "المطارات والطيران المدني",
        airlines: "شركات الطيران السورية",
        consular: "الجوازات والسفارات",
        visas: "هل تحتاج تأشيرة؟",
        borders: "المعابر البرية",
        tracking: "تتبع الرحلات",
      },
      airlinesLede: "تحقق من رحلتك لدى شركة الطيران نفسها، أياً كانت الجهة التي حجزت عبرها. شركات الطيران الأجنبية التي تطير إلى سوريا مدرجة في صفحة الطيران.",
      visasLede: "عدا منصة التأشيرة السورية، هذه أدوات مستقلة لا مصادر رسمية. تأكد من سفارة البلد الذي تقصده قبل الحجز.",
      status: { down: "لا يعمل حالياً", building: "قيد الإنشاء" },
      kinds: {
        site: "الموقع",
        page: "صفحة",
        telegram: "تيليغرام",
        facebook: "فيسبوك",
        instagram: "إنستغرام",
        x: "إكس",
        youtube: "يوتيوب",
        whatsapp: "قناة واتساب",
        ios: "تطبيق آيفون",
        android: "تطبيق أندرويد",
      },
      onSite: "على fly.sy",
      official: "الموقع الرسمي",
      all: "كل الروابط الرسمية",
      missing: "تعرف رابطاً رسمياً ناقصاً، أو رابطاً تغيّر؟ راسلنا على",
    },
    reports: {
      title: "تجارب حقيقية",
      lede: "أدق ما في الموقع جاء من أشخاص عبروا فعلاً. نتحقق قبل النشر، ولا ننشر أسماء.",
      add: "أضف تجربتك",
      editor: "تحقق فريق fly.sy",
      community: "متحقق",
      empty: "لا تجارب منشورة بعد. كن أول من يضيف.",
      wait: "انتظار",
      form: {
        title: "كيف كان العبور؟",
        lede: "دقيقتان. تجربتك تصحّح الأرقام التي يراها الجميع.",
        entry: "من أين دخلت؟",
        date: "متى؟",
        wait: "كم انتظرت؟ (بالدقائق)",
        passport: "جوازك",
        note: "ماذا طُلب منك، وماذا دفعت؟",
        contact: "بريد أو رقم للتأكيد (لن يُنشر)",
        consent: "هذا ما حدث معي فعلاً. أفهم أن فريق fly.sy سيراجعه قبل النشر وقد يتواصل معي للتأكيد.",
        submit: "أرسل التجربة",
        sending: "جارٍ الإرسال…",
        done: "وصلت. سنراجعها قبل النشر — شكراً.",
        errorGeneric: "لم تُرسل. حاول مرة أخرى أو راسلنا مباشرة.",
        errorInvalid: "تحقق من الحقول المطلوبة.",
        notConfigured: "استقبال التجارب غير مفعّل على هذه النسخة. راسلنا مباشرة.",
        passports: { sy: "سوري", voa: "تأشيرة عند الوصول", res: "موافقة مسبقة" },
      },
    },
    about: {
      title: "من أين تأتي المعلومات",
      lede: "كل سطر يحمل مصدره ودرجة ثقته وتاريخ مراجعته. حين لا نجد مصدراً موثوقاً نقول ذلك بدل أن نملأ الفراغ بتخمين.",
      what: "ما هو fly.sy",
      whatText:
        "fly.sy يجيب عن سؤال واحد: كيف أصل إلى سوريا اليوم؟ الرحلات الجوية، المعابر البرية، والأوراق المطلوبة، للسوريين في الخارج وللزوار الأجانب. مستقل، غير رسمي، لا يبيع شيئاً، ولا يتبع أي جهة حكومية أو شركة طيران أو سفارة.",
      levels: "درجات الثقة",
      lv: {
        verified: "من جهة رسمية أو من المشغّل نفسه، أو تجربة مسافر تم التحقق منها.",
        reported: "من تقارير صحفية أو شركات سياحة. صحيح على الأرجح، غير مؤكد من المصدر الأول.",
        unconfirmed: "لم نتحقق منه. لا تحجز بناءً عليه.",
      },
      how: "كيف نتحقق",
      howText:
        "نراجع كل سطر دورياً ونحدّث تاريخ «روجع» حتى لو لم يتغير شيء، فالتاريخ الحديث على معلومة ثابتة هو إشارة أن الموقع حي. خطوط الطيران تُقارن بلوحات المطارات الرسمية وبيانات التتبع. شركات السياحة والصحافة لا تتجاوز مستوى «من تقارير». المستوى «متحقق» للجهات الرسمية والمشغّل نفسه وتجارب المسافرين بعد التحقق منها.",
      faq: "أسئلة شائعة",
      faqs: [
        {
          q: "هل مطار دمشق الدولي يعمل؟",
          a: "نعم بحسب هيئة الطيران المدني ولوحة المطار: يعمل بانتظام منذ 8 نيسان 2026 مع نحو 30 رحلة مغادرة يومياً. صفحة المطار تعرض الحالة الحالية وشركات الطيران التي تهبط فيه وتاريخ آخر مراجعة.",
        },
        {
          q: "ما الموقع الرسمي لمطار دمشق الدولي؟",
          a: "damairport.gov.sy، ويقول إنه الموقع الرسمي الوحيد للمطار. موقع مطار حلب alpairport.gov.sy ومطار دير الزور deirezzorairport.gov.sy، وتشغّل الثلاثة هيئة الطيران المدني. والروابط الرسمية التي تحققنا منها، ومنها حسابات الهيئة والسورية للطيران ووزارة الخارجية، في صفحة الروابط الرسمية.",
        },
        {
          q: "هل يمكن للأجانب دخول سوريا براً من تركيا؟",
          a: "معبر باب الهوى مفتوح للسوريين والأتراك وحاملي الجنسيتين فقط بحسب مصادرنا. الأجانب عموماً يدخلون عبر لبنان أو الأردن أو جواً.",
        },
        {
          q: "كم تكلف التأشيرة عند الوصول؟",
          a: "الرسم نقداً بالدولار عند الوصول، تقريباً بين 25 و400 دولار حسب الجنسية، بحسب نشرات حكومية أجنبية. انظر صفحة الأوراق المطلوبة.",
        },
        {
          q: "هل توجد رحلات مباشرة من أوروبا إلى سوريا؟",
          a: "نعم، عدد قليل منها: صن دير من برلين، وليف من دوسلدورف وكولن، ودان إير من بوخارست، والسورية للطيران من أمستردام وكوبنهاغن وفيينا. شركات الطيران الأوروبية الكبرى لا تطير إلى سوريا التزاماً بتوصية EASA بشأن الأجواء السورية، وهي توصية لا حظر، لذلك تمر معظم الرحلات الأخرى عبر إسطنبول أو الخليج، أو إلى بيروت ثم براً.",
        },
        {
          q: "من يقف خلف fly.sy؟",
          a: "مشروع مستقل من سوريين في المهجر، لا تديره جهة حكومية ولا شركة طيران ولا وكالة سفر.",
        },
      ],
      sources: "المصادر",
      contact: "تواصل معنا",
      contactText: "تصحيح، طريق لا نعرفه، أو سؤال: راسلنا على",
      join: "حابب تبني fly.sy معنا؟",
      joinText:
        "إذا عندك خبرة برمجية backend أو تصميمية frontend وتقدر تفيد الموقع من خبراتك، حط إيدك بإيدنا وخلينا نزبط الموقع بشكل يليق بسوريا والسوريين وزوارها الأعزاء من كل أنحاء العالم!",
      fine: "هذا الموقع نقطة انطلاق للتحقق لا بديل عنه. الوضع يتغير بسرعة، والقواعد تُطبَّق أحياناً بشكل مختلف من موظف لآخر، وقد تكون معلومة صحيحة يوم مراجعتها وخاطئة اليوم. أكّد كل شيء مع شركة الطيران أو السفارة، ولا تشترِ تذكرة غير قابلة للاسترداد قبل أن تتأكد من أوراقك.",
    },
    disclaimer: {
      title: "قبل أن تخطط",
      body: [
        "fly.sy يعطيك فكرة عمّا تتوقعه. نجمع المعلومات ونعرض مصدر كل سطر، ولا نتحمّل أي مسؤولية عن هذه المعلومات ولا عن أي شيء يترتب عليها.",
        "أنت، كزائر أو مسافر، مسؤول عن التأكد من كل شيء من المصادر نفسها أو من الجهات المعنية: شركة الطيران، المطار، السفارة، المعبر.",
        "المعلومات محدّثة في العادة، لكننا لا نتحمّل أي مسؤولية عنها.",
      ],
      accept: "فهمت",
    },
    footer: {
      explore: "استكشف",
      documents: "الأوراق المطلوبة",
      disclaimer: "غير رسمي. أكّد كل شيء مع شركة الطيران أو السفارة قبل السفر.",
    },
    notFound: {
      title: "الصفحة غير موجودة",
      text: "ربما تغيّر الرابط. ابدأ من الصفحة الرئيسية.",
      home: "إلى الرئيسية",
    },
    seo: {
      home: {
        title: "كيف تصل إلى سوريا اليوم: الطيران والمعابر البرية والأوراق المطلوبة",
        description:
          "كل طريق إلى سوريا اليوم من تركيا ولبنان والأردن والخليج وأوروبا: الرحلات الجوية والمعابر البرية والوقت المتوقع والأوراق المطلوبة لكل جواز، مع مصدر كل معلومة وتاريخ مراجعتها.",
      },
      airlines: {
        title: "شركات الطيران التي تطير إلى سوريا {year}: الرحلات إلى دمشق وحلب",
        description:
          "من يطير إلى دمشق وحلب ودير الزور الآن، ومن أين، وكم تستغرق الرحلة: الخطوط التركية والقطرية وفلاي دبي والملكية الأردنية والسورية للطيران وغيرها، مع مصدر كل خط وتاريخ مراجعته.",
      },
      airline: {
        title: "رحلات {airline} إلى سوريا: الخطوط إلى دمشق وحلب",
        description: "خطوط {airline} إلى سوريا اليوم: {routes}. حالة كل خط ومدة الرحلة ومصدر المعلومة وتاريخ مراجعتها.",
      },
      crossings: {
        title: "المعابر البرية إلى سوريا: حالة كل معبر اليوم",
        description:
          "كل معبر بري إلى سوريا من لبنان والأردن وتركيا والعراق، من جديدة يابوس ونصيب إلى باب الهوى وباب السلامة وسيمالكا: مفتوح أم مغلق، ساعات العمل، من يُسمح له بالعبور، ومصدر كل سطر.",
      },
      entry: {
        title: "{name} اليوم: {status}، ومن يمكنه العبور وما يحتاجه",
        description: "{name}: الحالة {status}، روجعت في {seen} من {source}. {note} الطرق التي تمر من هنا، أزمنة الطريق إلى المدن، والأوراق المطلوبة.",
        airportTitle: "{name} اليوم: {status}، ومن يطير إليه وما تحتاجه",
        airportDescription: "{name}: الحالة {status}، روجعت في {seen} من {source}. {note} شركات الطيران التي تهبط هنا، الوجهات، أزمنة الطريق إلى المدن، والأوراق المطلوبة.",
      },
      route: {
        title: "من {origin} إلى {city}: كيف تصل، كم تستغرق، وما تحتاجه",
        description:
          "{n} من الطرق من {origin} إلى {city}؛ أسرعها {mode} عبر {entry} بنحو {hours}. الحالة والأوراق المطلوبة لكل جواز، ومصدر كل معلومة وتاريخ مراجعتها.",
        descriptionNone: "لا نعرف طريقاً مفتوحاً من {origin} إلى {city}. ما نعرفه، ومصدره، وتاريخ مراجعته.",
      },
      documents: {
        title: "الأوراق المطلوبة لدخول سوريا: للسوريين وللأجانب، جواً وبراً",
        description:
          "ما تحتاجه لدخول سوريا بجواز سوري، أو بتأشيرة عند الوصول، أو بموافقة مسبقة، جواً وبراً: الرسوم، صلاحية الجواز، الموافقات، والفراغات التي لا نملك لها مصدراً.",
      },
      news: {
        title: "أخبار السفر إلى سوريا: المعابر والمطارات والرحلات الجديدة",
        description:
          "آخر ما تغيّر في الطريق إلى سوريا: فتح وإغلاق المعابر والمطارات، خطوط الطيران الجديدة، وقواعد الدخول، مع مصدر رسمي وتاريخ لكل خبر.",
      },
      links: {
        title: "الروابط الرسمية للسفر إلى سوريا: مواقع المطارات والطيران المدني وشركات الطيران والسفارات",
        description:
          "المواقع والحسابات الرسمية لمطارات دمشق وحلب ودير الزور، وهيئة الطيران المدني، والسورية للطيران وفلاي شام، ووزارة الخارجية والسفارات، وأدوات التحقق من التأشيرة. كل رابط متحقق منه ومؤرخ.",
      },
      reports: {
        title: "تجارب حقيقية في الدخول إلى سوريا: الانتظار وما طُلب عند كل معبر",
        description:
          "تجارب أشخاص عبروا فعلاً إلى سوريا: كم انتظروا في جديدة يابوس ونصيب ومطار دمشق، ماذا طُلب منهم وماذا دفعوا. نتحقق قبل النشر ولا ننشر أسماء.",
      },
      reportNew: {
        title: "أضف تجربتك في العبور إلى سوريا",
        description: "دقيقتان. تجربتك في المعبر أو المطار تصحّح الأرقام التي يراها الجميع. نتحقق قبل النشر ولا ننشر أسماء.",
      },
      about: {
        title: "عن fly.sy: مصادرنا ومستويات الثقة وكيف نتحقق",
        description:
          "fly.sy موقع مستقل غير رسمي يجيب عن سؤال واحد: كيف أصل إلى سوريا اليوم؟ هنا مصادرنا، مستويات الثقة، طريقة التحقق، والأسئلة الشائعة.",
      },
    },
    lang: "English",
  },
  en: {
    brand: "fly.sy",
    meta: {
      title: "fly.sy — How to get into Syria",
      description: "Every route into Syria, with the source and the date checked on every line. Independent and unofficial.",
      card: "fly.sy — How to get into Syria. Every route, with a source on every line. Independent, unofficial.",
    },
    tabs: { plan: "Plan", airlines: "Airlines", crossings: "Crossings", news: "News", reports: "Reports", links: "Official links", about: "About" },
    nav: {
      label: "Main",
      trip: "Trip",
      flights: "Flights",
      borders: "Borders",
      papers: "Papers",
      news: "News",
      experiences: "Experiences",
      links: "Links",
      short: { experiences: "Reports" },
      search: "Search",
      searchHint: "Search a country, airport, crossing or airline",
      searchEmpty: "No results. Try a country or city name.",
      searchLoading: "Loading…",
      groups: { countries: "From a country to Damascus", airports: "Airports", crossings: "Land crossings", airlines: "Airlines", pages: "Pages" },
      toDamascus: "to Damascus",
    },
    indep: "Independent and unofficial. Not part of any government body; represents no airline or embassy. Updated by hand and from people's real experiences.",
    updated: "Last updated",
    ask: { in: "I'm in", with: "with", to: "heading to", via: "with a connection", fromLabel: "From", toLabel: "To", passportLabel: "My passport" },
    way: {
      thenRoad: "{entry}, then by road",
      fastest: "Fastest",
      flights: "Flights: {n}",
      from: "from {cities}",
      flyLeg: "Flight {time}",
      roadLeg: "{time} by road to {city}",
      borderLeg: "{time} to the border",
      syriansOnly: "Syrians and Turks only",
      noTime: "Time not known",
      board: "Flights to {entry}",
      boardLand: "Routes through {entry}",
      more: "Other ways",
      open: "Open",
    },
    regions: { near: "Around Syria", gulf: "The Gulf", europe: "Europe", other: "Elsewhere" },
    status: { open: "Operating", caution: "Conditional", closed: "Closed", unknown: "Unknown" },
    confidence: { verified: "verified", reported: "reported", unconfirmed: "unconfirmed" },
    mode: { air: "Fly", land: "Overland" },
    checked: "checked",
    source: "Source",
    routes: "Your routes",
    routesEmpty: "We know of no route from here. If you know one, tell us.",
    estimates: "Times are estimates and usually include waiting at the crossing",
    road: "Road",
    to: "to",
    need: "What you need on this route",
    blocked: "Not open to this passport",
    blockedWhy: "Open to Syrians, Turkish citizens and dual nationals only.",
    fromCity: "from",
    home: "Home",
    homeTitle: "How to get to Syria today",
    langSwitch: "اقرأ بالعربية",
    airlines: {
      title: "Who flies to Syria",
      lede: "Every airline landing in Damascus, Aleppo or Deir ez-Zor today, from where, how long the flight takes, and how sure we are.",
      empty: "No known routes.",
      routes: "Routes to Syria",
      country: "Home country",
      more: "Other airlines flying to Syria",
    },
    crossings: {
      title: "Land crossings",
      lede: "The status of every land border into Syria today, from Lebanon, Jordan, Türkiye and Iraq: open or closed, who is allowed through, and the source behind each line.",
      airports: "Airports",
      airportsLede: "Syria's airports and where each stands today: which operate, who lands there, and when the line was last checked.",
      more: "Other crossings",
    },
    entry: {
      via: "Routes through",
      viaEmpty: "We know of no route through here at the moment.",
      roads: "Road from here to each city",
      roadsNote: "fly.sy estimates in hours, not counting the wait at the border.",
      reports: "Experiences from here",
      reportsEmpty: "No published experiences from here yet.",
      need: "What you need to cross here",
      plan: "Plan a journey through this entry point",
      from: "from",
    },
    route: {
      title: "From {origin} to {city}",
      lede: "Every way we know from {origin} to {city}, ranked by total time. Pick your passport to see what applies to you. Each line carries its source and the date it was checked.",
      answer: "Fastest way from {origin} to {city} today: {how}, about {hours} door to door (checked {date}). {running} of {total} known routes are running.",
      answerNone: "We know of no running route from {origin} to {city} for this passport today. {total} known routes in all.",
      how: { air: "fly to {entry}", land: "overland via {entry}" },
      list: "Routes from {origin} to {city}",
      passports: "Your passport changes the answer",
      otherDest: "Other destinations from {origin}",
      otherOrigin: "To {city} from other countries",
      entries: "Entry points on this route",
    },
    partner: {
      tag: "Partner",
      title: "Need help booking?",
      text: "{name} is a travel agency we use and recommend. Message them on WhatsApp and ask about this trip.",
      cta: "{name} on WhatsApp",
      fine: "{name} is run by the family of fly.sy's founder. You book with them, not with fly.sy, and the routes here are listed and ranked the same way with or without them.",
      message: "Hello, I found you through fly.sy. I'd like to travel from {origin} to {city}.",
      faq: {
        q: "Does fly.sy work with a travel agency?",
        a: "With one: {name}, which is run by the family of fly.sy's founder. Some route pages show it in a card marked \"Partner\". You book with them, not with fly.sy, and routes are listed and ranked the same way with or without them.",
      },
    },
    documents: {
      title: "Documents you need to enter Syria",
      lede: "What you need, by how you enter and which passport you hold. Every line carries its source, and where there is no dependable source we say so instead of guessing.",
      air: "Entering by air",
      land: "Entering by land",
      which: "Which passport do you hold?",
      warn: "Confirm with the embassy or airline before buying a non-refundable ticket. Rules change and are applied differently by different officials.",
    },
    news: {
      title: "News on the way into Syria",
      lede: "What changed at airports, crossings, flights and paperwork, each with its date and source. Every item comes from the official body or the operator itself, and the site's data is updated with it.",
      related: "Related",
      empty: "No news yet.",
    },
    links: {
      title: "Official links for travelling to Syria",
      lede: "The official websites and accounts of the Damascus, Aleppo and Deir ez-Zor airports, the civil aviation authority, Syrian airlines, the foreign ministry and the border authorities, and tools to check whether your passport needs a visa.",
      how: "We check every link ourselves, and each card shows when. An account is listed only when the body's own website links to it; we found no website for the ports authority, so we list the Telegram channel we already cite for crossings.",
      warn: "The airports ask travellers to follow only the official accounts. Before you pay or send a document, check the address against the one here.",
      jump: "On this page",
      groups: {
        aviation: "Airports and civil aviation",
        airlines: "Syrian airlines",
        consular: "Passports and embassies",
        visas: "Do you need a visa?",
        borders: "Land borders",
        tracking: "Flight tracking",
      },
      airlinesLede: "Check your flight with the airline itself, however you booked it. Foreign airlines flying to Syria are listed on the airlines page.",
      visasLede: "Apart from Syria's own e-visa site, these are independent tools, not official sources. Confirm with the embassy of the country you are going to before you book.",
      status: { down: "Not working right now", building: "Under construction" },
      kinds: {
        site: "Website",
        page: "Page",
        telegram: "Telegram",
        facebook: "Facebook",
        instagram: "Instagram",
        x: "X",
        youtube: "YouTube",
        whatsapp: "WhatsApp channel",
        ios: "iPhone app",
        android: "Android app",
      },
      onSite: "on fly.sy",
      official: "Official website",
      all: "All official links",
      missing: "Know an official link that's missing, or one that has changed? Write to",
    },
    reports: {
      title: "Real experiences",
      lede: "The best lines on this site came from people who actually made the trip. We check before publishing, and never publish names.",
      add: "Add your experience",
      editor: "Checked by fly.sy",
      community: "Verified",
      empty: "No published reports yet. Be the first.",
      wait: "wait",
      form: {
        title: "How was the crossing?",
        lede: "Two minutes. Your experience corrects the numbers everyone sees.",
        entry: "Where did you enter?",
        date: "When?",
        wait: "How long did you wait? (minutes)",
        passport: "Your passport",
        note: "What were you asked for, and what did you pay?",
        contact: "Email or number so we can confirm (never published)",
        consent: "This is what actually happened to me. I understand fly.sy will review it before publishing and may contact me to confirm.",
        submit: "Send",
        sending: "Sending…",
        done: "Received. We'll review it before publishing — thank you.",
        errorGeneric: "Not sent. Try again, or message us directly.",
        errorInvalid: "Check the required fields.",
        notConfigured: "Report intake isn't enabled on this deployment. Message us directly.",
        passports: { sy: "Syrian", voa: "Visa on arrival", res: "Pre-approval" },
      },
    },
    about: {
      title: "Where this comes from",
      lede: "Every line carries its source, its confidence level and the date it was reviewed. Where we can't find a dependable source, we say so instead of filling the gap with a guess.",
      what: "What fly.sy is",
      whatText:
        "fly.sy answers one question: how do I get into Syria today? Flights, land crossings and the paperwork, for Syrians abroad and for foreign visitors. It is independent and unofficial, sells nothing, and is not part of any government body, airline or embassy.",
      levels: "Confidence levels",
      lv: {
        verified: "From an official body, the operator itself, or a checked traveller report.",
        reported: "From press or tour operators. Probably right, not confirmed at first hand.",
        unconfirmed: "Not checked. Don't book on it.",
      },
      how: "How we verify",
      howText:
        "Every line is re-read on a schedule and its \"checked\" date is bumped even when nothing changed: a fresh date on an unchanged fact is the signal the site is alive. Air routes are checked against the airports' own boards and flight tracking. Tour operators and press are capped at \"reported\". Only official bodies, the operator itself, or a traveller report we have checked earn \"verified\".",
      faq: "Common questions",
      faqs: [
        {
          q: "Is Damascus International Airport open?",
          a: "Yes, according to the civil aviation authority and the airport's own board: regular operations since 8 April 2026, about 30 departures a day. The airport's page lists its current status, the airlines landing there and the date it was last checked.",
        },
        {
          q: "What is the official website of Damascus International Airport?",
          a: "damairport.gov.sy, which says it is the airport's only official website. Aleppo airport's is alpairport.gov.sy and Deir ez-Zor's is deirezzorairport.gov.sy; the civil aviation authority operates all three. The official links we have checked, including the authority's, Syrian Air's and the foreign ministry's accounts, are on the Official links page.",
        },
        {
          q: "Can foreigners enter Syria overland from Türkiye?",
          a: "Bab al-Hawa is open to Syrians, Turkish citizens and dual nationals only, according to our sources. Foreign visitors generally enter through Lebanon or Jordan, or by air.",
        },
        {
          q: "How much is the visa on arrival?",
          a: "US-dollar cash on arrival, roughly $25 to $400 depending on nationality, according to foreign government advisories. See the documents page.",
        },
        {
          q: "Are there direct flights from Europe to Syria?",
          a: "Yes, a few: Sundair from Berlin, LEAV Aviation from Düsseldorf and Cologne, Dan Air from Bucharest, and Syrian Air from Amsterdam, Copenhagen and Vienna. The big European airlines stay out, following EASA's advice on Syrian airspace (advice, not a ban), so most other trips connect through Istanbul or the Gulf, or fly to Beirut and continue overland.",
        },
        {
          q: "Who is behind fly.sy?",
          a: "An independent project by Syrians in the diaspora. No government body, airline or travel agency runs it.",
        },
      ],
      sources: "Sources",
      contact: "Contact",
      contactText: "A correction, a route we don't know about, or a question: write to",
      join: "Want to build fly.sy with us?",
      joinText:
        "If you have backend or frontend design experience and can help the site with your skills, join hands with us and let's make it worthy of Syria, Syrians, and their dear visitors from all over the world!",
      fine: "This site is a starting point for checking, not a substitute for it. Things change fast, rules are applied differently by different officials, and a line that was right when we checked it may be wrong today. Confirm everything with the airline or the embassy, and don't buy a non-refundable ticket before your paperwork is settled.",
    },
    disclaimer: {
      title: "Before you plan",
      body: [
        "fly.sy gives you an idea of what to expect. We collect information and show you where every line came from. We accept no liability for that information or for anything that happens because of it.",
        "As a visitor or traveller, you are responsible for confirming everything with the same sources or with the officials concerned: the airline, the airport, the embassy, the crossing.",
        "The information is usually up to date, but we hold no responsibility for it.",
      ],
      accept: "I understand",
    },
    footer: {
      explore: "Explore",
      documents: "Documents you need",
      disclaimer: "Unofficial. Confirm everything with the airline or embassy before you travel.",
    },
    notFound: {
      title: "Page not found",
      text: "The link may have changed. Start from the home page.",
      home: "Go home",
    },
    seo: {
      home: {
        title: "How to get to Syria today: flights, land crossings and the papers you need",
        description:
          "Every way into Syria today from Türkiye, Lebanon, Jordan, the Gulf and Europe: flights, land crossings, journey times and the documents each passport needs, with a source and check date on every line.",
      },
      airlines: {
        title: "Airlines flying to Syria in {year}: routes to Damascus and Aleppo",
        description:
          "Who flies to Damascus, Aleppo and Deir ez-Zor right now, from where and how long it takes: Turkish Airlines, Qatar Airways, flydubai, Royal Jordanian, Syrian Air and more, each with its source and check date.",
      },
      airline: {
        title: "{airline} flights to Syria: routes to Damascus and Aleppo",
        description: "{airline} routes into Syria today: {routes}. Status, flight time, source and check date for each.",
      },
      crossings: {
        title: "Syria land border crossings: the status of every crossing today",
        description:
          "Every land crossing into Syria from Lebanon, Jordan, Türkiye and Iraq, from Jdeidet Yabous and Nasib to Bab al-Hawa, Bab al-Salama and Semalka: open or closed, hours, who can cross, and the source behind each line.",
      },
      entry: {
        title: "{name} today: {status}, who can cross and what you need",
        description: "{name}: status {status}, checked {seen} against {source}. {note} Routes through here, road times to each city, and the documents required.",
        airportTitle: "{name} today: {status}, who flies there and what you need",
        airportDescription: "{name}: status {status}, checked {seen} against {source}. {note} Airlines landing here, where they fly from, road times to each city, and the documents required.",
      },
      route: {
        title: "{origin} to {city}: how to get there, how long it takes, what you need",
        description:
          "{n} ways from {origin} to {city}; the fastest is {mode} via {entry}, about {hours}. Status, documents for each passport, source and check date for every line.",
        descriptionNone: "We know of no open route from {origin} to {city}. What we do know, its source, and when it was checked.",
      },
      documents: {
        title: "Documents to enter Syria: Syrians, visa on arrival and pre-approval, by air and land",
        description:
          "What you need to enter Syria on a Syrian passport, with a visa on arrival, or with prior approval, by air and by land: fees, passport validity, approvals, and the gaps we have no source for.",
      },
      news: {
        title: "Syria travel news: border crossings, airports and new flights",
        description:
          "The latest changes on the way into Syria: crossings and airports opening or closing, new airline routes and entry rules, each with an official source and a date.",
      },
      links: {
        title: "Official websites for Syria travel: airports, civil aviation, airlines and embassies",
        description:
          "The official websites and accounts of Damascus, Aleppo and Deir ez-Zor airports, the civil aviation authority, Syrian Air, Fly Cham and the foreign ministry, plus visa checkers. Every link checked and dated.",
      },
      reports: {
        title: "Real experiences entering Syria: waits, documents and fees at each crossing",
        description:
          "First-hand reports from people who crossed into Syria: how long they waited at Jdeidet Yabous, Nasib and Damascus airport, what they were asked for and what they paid. Checked before publishing, never with names.",
      },
      reportNew: {
        title: "Add your experience crossing into Syria",
        description: "Two minutes. Your experience at the border or airport corrects the numbers everyone sees. Checked before publishing, never with names.",
      },
      about: {
        title: "About fly.sy: sources, confidence levels and how we verify",
        description:
          "fly.sy is an independent, unofficial site answering one question: how do I get into Syria today? Our sources, confidence levels, verification method and common questions.",
      },
    },
    lang: "العربية",
  },
} as const

export type Messages = (typeof messages)["ar"]
export const getMessages = (locale: Locale): Messages => messages[locale] as unknown as Messages

/**
 * The strings client components read through useMessages(). The provider in the root layout is handed only
 * these, because whatever it is handed is serialized into every page: the rest of the dictionary (page text,
 * FAQs, SEO titles) is read on the server and has no business in each page's payload. A client component that
 * reaches for another key fails the type check; add the key here.
 */
const CLIENT_KEYS = ["nav", "disclaimer", "lang", "langSwitch", "ask", "regions", "reports"] as const
export type ClientMessages = Pick<Messages, (typeof CLIENT_KEYS)[number]>
export const clientMessages = (m: Messages): ClientMessages =>
  Object.fromEntries(CLIENT_KEYS.map((k) => [k, m[k]])) as ClientMessages
