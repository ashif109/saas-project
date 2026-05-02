const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
    try {
        console.log('Seeding faculty user...');

        // 1. Check if department exists, if not create one
        let dept = await prisma.department.findFirst();
        if (!dept) {
            dept = await prisma.department.create({
                data: {
                    name: 'Computer Science',
                    code: 'CS',
                    description: 'Computer Science Dept'
                }
            });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Faculty@123', salt);

        // 3. Create or update user
        let user = await prisma.user.findUnique({
            where: { email: 'michealasif41@gmail.com' }
        });

        if (user) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword
                }
            });
        } else {
            user = await prisma.user.create({
                data: {
                    firstName: 'Micheal',
                    lastName: 'Asif',
                    email: 'michealasif41@gmail.com',
                    password: hashedPassword,
                    phone: '1234567890'
                }
            });
        }

        // 4. Create or update user role mapping
        const roleRecord = await prisma.role.findFirst({
            where: { name: 'FACULTY' }
        });

        if (roleRecord) {
            const userRole = await prisma.userRole.findFirst({
                where: { userId: user.id, roleId: roleRecord.id }
            });

            if (!userRole) {
                await prisma.userRole.create({
                    data: {
                        userId: user.id,
                        roleId: roleRecord.id
                    }
                });
            }
        }

        // 5. Create Faculty Profile
        let profile = await prisma.facultyProfile.findUnique({
            where: { userId: user.id }
        });

        if (!profile) {
            await prisma.facultyProfile.create({
                data: {
                    userId: user.id,
                    departmentId: dept.id,
                    employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
                    joiningDate: new Date()
                }
            });
        }

        console.log('Faculty user seeded successfully!');
    } catch (error) {
        console.error('Error seeding faculty:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
