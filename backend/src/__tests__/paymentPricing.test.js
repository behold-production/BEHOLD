describe('Payment Pricing & Session Duration Calculations', () => {
  const calculatePrice = (counsellor, duration, couponCode, settings = {}) => {
    const durationVal = Number(duration) || 60;
    const isHalfSession = durationVal === 30;

    const rawPrice = Number(counsellor.price) || 899;
    const halfPrice = counsellor.halfSessionPrice !== undefined && Number(counsellor.halfSessionPrice) > 0
      ? Number(counsellor.halfSessionPrice)
      : (rawPrice <= 899 ? 499 : rawPrice >= 1200 ? 699 : Math.round(rawPrice * 0.5));
    const baseFee = isHalfSession ? halfPrice : rawPrice;

    const gstEnabled = settings.gstEnabled === true;
    const gstPercent = gstEnabled ? Number(settings.gstPercent) || 0 : 0;
    const gstAmount = gstPercent > 0 ? Math.round(baseFee * (gstPercent / 100)) : 0;
    const totalBeforeDiscount = baseFee + gstAmount;

    let appliedDiscount = 0;
    if (couponCode && settings.promoCodes && Array.isArray(settings.promoCodes)) {
      const cleanCoupon = couponCode.toUpperCase().trim();
      const foundPromo = settings.promoCodes.find(
        (p) => p.code.toUpperCase() === cleanCoupon && p.isActive !== false
      );
      if (foundPromo) {
        if (foundPromo.type === 'PERCENTAGE') {
          appliedDiscount = Math.round(totalBeforeDiscount * (foundPromo.value / 100));
        } else {
          appliedDiscount = foundPromo.value;
        }
      }
    }
    const netTotal = Math.max(1, totalBeforeDiscount - appliedDiscount);
    const amountInPaise = netTotal * 100;

    return {
      baseFee,
      gstAmount,
      appliedDiscount,
      netTotal,
      amountInPaise,
      durationStr: isHalfSession ? '30 Minutes' : '1 Hour (60 Mins)'
    };
  };

  test('should calculate 499 (49900 paise) for a 30-min session when counsellor price is 899', () => {
    const counsellor = { price: 899, halfSessionPrice: 499 };
    const result = calculatePrice(counsellor, 30);
    expect(result.baseFee).toBe(499);
    expect(result.netTotal).toBe(499);
    expect(result.amountInPaise).toBe(49900);
    expect(result.durationStr).toBe('30 Minutes');
  });

  test('should calculate 899 (89900 paise) for a 60-min session when counsellor price is 899', () => {
    const counsellor = { price: 899, halfSessionPrice: 499 };
    const result = calculatePrice(counsellor, 60);
    expect(result.baseFee).toBe(899);
    expect(result.netTotal).toBe(899);
    expect(result.amountInPaise).toBe(89900);
    expect(result.durationStr).toBe('1 Hour (60 Mins)');
  });

  test('should compute fallback halfSessionPrice 499 when full price is 899 and halfSessionPrice is not set', () => {
    const counsellor = { price: 899 };
    const result = calculatePrice(counsellor, 30);
    expect(result.baseFee).toBe(499);
    expect(result.netTotal).toBe(499);
    expect(result.amountInPaise).toBe(49900);
  });

  test('should calculate custom halfSessionPrice if explicitly configured on counsellor', () => {
    const counsellor = { price: 1500, halfSessionPrice: 799 };
    const result = calculatePrice(counsellor, 30);
    expect(result.baseFee).toBe(799);
    expect(result.netTotal).toBe(799);
    expect(result.amountInPaise).toBe(79900);
  });

  test('should apply promo code discount correctly on 30-min session', () => {
    const counsellor = { price: 899, halfSessionPrice: 499 };
    const settings = {
      promoCodes: [
        { code: 'BEHOLD100', value: 100, type: 'FIXED', isActive: true }
      ]
    };
    const result = calculatePrice(counsellor, 30, 'BEHOLD100', settings);
    expect(result.baseFee).toBe(499);
    expect(result.appliedDiscount).toBe(100);
    expect(result.netTotal).toBe(399);
    expect(result.amountInPaise).toBe(39900);
  });

  test('should compute GST correctly on 30-min session when GST is enabled', () => {
    const counsellor = { price: 899, halfSessionPrice: 499 };
    const settings = {
      gstEnabled: true,
      gstPercent: 18
    };
    const result = calculatePrice(counsellor, 30, null, settings);
    expect(result.baseFee).toBe(499);
    expect(result.gstAmount).toBe(90); // Math.round(499 * 0.18) = 90
    expect(result.netTotal).toBe(589);
    expect(result.amountInPaise).toBe(58900);
  });
});
