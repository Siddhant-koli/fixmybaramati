import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

const validateFullName = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return 'Full name is required';
  if (trimmed.length < 2) return 'Full name must be at least 2 characters';
  return '';
};

const validateMobileNumber = (value: string) => {
  const cleaned = value.replace(/[^\d]/g, '');

  if (!value) return 'Mobile number is required';
  if (cleaned.length !== 10) return 'Mobile number must be exactly 10 digits';
  if (!/^[6-9]\d{9}$/.test(cleaned)) return 'Mobile number must start with 6-9';
  return '';
};

const validatePassword = (value: string) => {
  if (!value) return 'Password is required';
  if (value.length < 6) return 'Password must be at least 6 characters';
  return '';
};

const validateConfirmPassword = (password: string, confirmPassword: string) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fullName = String(body.fullName ?? '').trim();
    const mobileNumber = String(body.mobileNumber ?? '').trim();
    const password = String(body.password ?? '');
    const confirmPassword = String(body.confirmPassword ?? '');

    const errors: Record<string, string> = {
      fullName: validateFullName(fullName),
      mobileNumber: validateMobileNumber(mobileNumber),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    };

    const hasErrors = Object.values(errors).some((message) => message !== '');
    if (hasErrors) {
      return NextResponse.json(
        {
          success: false,
          errors,
          message: 'Please correct the highlighted details and try again.',
        },
        { status: 400 }
      );
    }

    const normalizedMobile = mobileNumber.replace(/[^\d]/g, '');
    const existingUser = await prisma.user.findUnique({
      where: { mobile: normalizedMobile },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'An account with this mobile number already exists.',
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        mobile: normalizedMobile,
        passwordHash,
      },
      select: {
        id: true,
        fullName: true,
        mobile: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful. Your account has been created.',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration failed:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Registration failed. Please try again later.',
      },
      { status: 500 }
    );
  }
}
