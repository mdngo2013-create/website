$(document).ready(function () {

    // 1. إظهار / إخفاء تفاصيل السيارة عبر jQuery
    $(".detail-toggle").change(function () {
        var detailsRow = $(this).closest("tr").next(".details-row");
        if ($(this).is(":checked")) {
            detailsRow.fadeIn();
        } else {
            detailsRow.fadeOut();
        }
    });

    // 2. الضغط على زر متابعة لإظهار الفورم
    $("#btnContinue").click(function () {
        var selectedCars = $(".car-select:checked");
        if (selectedCars.length === 0) {
            alert("يرجى اختيار سيارة واحدة على الأقل للمتابعة.");
            return;
        }
        $("#bookingSection").slideDown();
        $("html, body").animate({
            scrollTop: $("#bookingSection").offset().top
        }, 500);
    });

    // 3. إغلاق نافذة النتيجة
    $("#btnCloseModal").click(function () {
        $("#resultModal").fadeOut();
    });

    // 4. التحقق من صحة المدخلات وإرسال النموذج
    $("#btnSubmit").click(function () {
        var isValid = true;

        // تفريغ رسائل الأخطاء
        $(".error-msg").text("");

        // الحقول
        var fullName = $.trim($("#fullName").val());
        var nationalId = $.trim($("#nationalId").val());
        var startDateStr = $.trim($("#startDate").val());
        var endDateStr = $.trim($("#endDate").val());
        var phone = $.trim($("#phone").val());
        var email = $.trim($("#email").val());

        // التحقق من الاسم: أحرف هجائية عربية ومسافات فقط (يقبل القيمة الفارغة)
        if (fullName !== "") {
            var arabicPattern = /^[\u0621-\u064A\s]+$/;
            if (!arabicPattern.test(fullName)) {
                $("#errName").text("يجب أن يحتوي الاسم على أحرف هجائية عربية فقط.");
                isValid = false;
            }
        }

        // التحقق من الرقم الوطني: 11 خانة، إلزامي، أول خانتين (01 إلى 14)
        if (nationalId === "") {
            $("#errNationalId").text("الرقم الوطني إلزامي.");
            isValid = false;
        } else {
            var natPattern = /^(0[1-9]|1[0-4])[0-9]{9}$/;
            if (!natPattern.test(nationalId)) {
                $("#errNationalId").text("الرقم الوطني يجب أن يتألف من 11 رقماً ويبدأ بكود المحافظة (01 إلى 14).");
                isValid = false;
            }
        }

        // التحقق من تواريخ الحجز بصيغة yyyy-mm-dd
        var datePattern = /^\d{4}-\d{2}-\d{2}$/;
        var sDate, eDate;

        if (startDateStr === "") {
            $("#errStartDate").text("تاريخ البداية إلزامي.");
            isValid = false;
        } else if (!datePattern.test(startDateStr)) {
            $("#errStartDate").text("الصيغة المطلوبة: yyyy-mm-dd");
            isValid = false;
        } else {
            sDate = new Date(startDateStr);
            if (isNaN(sDate.getTime())) {
                $("#errStartDate").text("تاريخ بداية غير صالح.");
                isValid = false;
            }
        }

        if (endDateStr === "") {
            $("#errEndDate").text("تاريخ النهاية إلزامي.");
            isValid = false;
        } else if (!datePattern.test(endDateStr)) {
            $("#errEndDate").text("الصيغة المطلوبة: yyyy-mm-dd");
            isValid = false;
        } else {
            eDate = new Date(endDateStr);
            if (isNaN(eDate.getTime())) {
                $("#errEndDate").text("تاريخ نهاية غير صالح.");
                isValid = false;
            }
        }

        // التحقق من أن تاريخ النهاية لاحق لتاريخ البداية
        if (sDate && eDate && !isNaN(sDate.getTime()) && !isNaN(eDate.getTime())) {
            if (eDate <= sDate) {
                $("#errEndDate").text("يجب أن يكون تاريخ النهاية لاحقاً لتاريخ البداية.");
                isValid = false;
            }
        }

        // التحقق من الموبايل: Syriatel أو MTN (يقبل فارغ)
        if (phone !== "") {
            // Syriatel (093, 098, 099) - MTN (094, 095, 096)
            var phonePattern = /^(093|094|095|096|098|099)[0-9]{7}$/;
            if (!phonePattern.test(phone)) {
                $("#errPhone").text("رقم الموبايل يجب أن يبدأ بـ 09 ويتطابق مع شبكتي Syriatel أو MTN (10 أرقام).");
                isValid = false;
            }
        }

        // التحقق من الإيميل (يقبل فارغ)
        if (email !== "") {
            var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                $("#errEmail").text("يرجى إدخال بريد إلكتروني صالح.");
                isValid = false;
            }
        }

        // إذا نجح التحقق، يتم الحساب وعرض النتيجة
        if (isValid) {
            calculateAndShowResult(sDate, eDate);
        }
    });

    // دالة حساب عدد الأيام والمجاميع وتطبيق الخصم
    function calculateAndShowResult(startDate, endDate) {
        // حساب الفارق الزمني بالأيام
        var timeDiff = endDate.getTime() - startDate.getTime();
        var days = Math.ceil(timeDiff / (1000 * 3600 * 24));

        var subTotal = 0;
        var carsHtml = "<ul>";

        $(".car-select:checked").each(function () {
            var carName = $(this).data("name");
            var carCode = $(this).data("code");
            var pricePerDay = parseFloat($(this).val());
            var carTotal = pricePerDay * days;

            subTotal += carTotal;
            carsHtml += "<li><strong>" + carName + " (" + carCode + "):</strong> " + days + " يوم × " + pricePerDay.toLocaleString() + " = " + carTotal.toLocaleString() + " ل.س</li>";
        });

        carsHtml += "</ul>";

        // تطبيق خصم 10% إذا تجاوزت المدة 7 أيام
        var discount = 0;
        if (days > 7) {
            discount = subTotal * 0.10;
        }
        var finalTotal = subTotal - discount;

        var html = "<p><strong>مدة التأجير:</strong> " + days + " يوم/أيام</p>";
        html += "<p><strong>السيارات المختارة:</strong></p>" + carsHtml;
        html += "<p><strong>المجموع قبل الخصم:</strong> " + subTotal.toLocaleString() + " ل.س</p>";
        if (discount > 0) {
            html += "<p style='color:green;'><strong>خصم خاص (10% لتجاوز 7 أيام):</strong> -" + discount.toLocaleString() + " ل.س</p>";
        } else {
            html += "<p><strong>الخصم:</strong> لا يوجد (المدة 7 أيام أو أقل)</p>";
        }
        html += "<h4 style='color:#1a365d;'>المبلغ النهائي المطلوب: " + finalTotal.toLocaleString() + " ل.س</h4>";

        $("#resultContent").html(html);
        $("#resultModal").fadeIn();
    }
});