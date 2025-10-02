import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePackages } from '../hooks';
import UniversalHeader from './layout/UniversalHeader';
import Footer from './layout/Footer';

const PackagesViewPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { packages, loading, error } = usePackages();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleBackHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #e0f2fe 0%, #e8eaf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box textAlign='center'>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant='body1' color='text.secondary'>
            Đang tải danh sách gói bảo trì...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #e8eaf6 100%)',
      }}
    >
      {/* Universal Header */}
      <UniversalHeader isPublic={true} />

      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 6,
          mb: 4,
          mt: 8, // Add margin top for fixed header
        }}
      >
        <Container maxWidth='lg'>
          <Box textAlign='center'>
            <Typography
              variant={isMobile ? 'h3' : 'h2'}
              component='h1'
              gutterBottom
              fontWeight='bold'
            >
              Gói Dịch Vụ Bảo Trì
            </Typography>
            <Typography
              variant='h5'
              sx={{
                opacity: 0.9,
                maxWidth: 600,
                mx: 'auto',
                mb: 2,
              }}
            >
              Lựa chọn gói dịch vụ phù hợp với nhu cầu của bạn
            </Typography>
            <Typography
              variant='body1'
              sx={{
                opacity: 0.8,
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              Các gói dịch vụ chuyên nghiệp với đội ngũ kỹ thuật viên giàu kinh
              nghiệm
            </Typography>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth='lg' sx={{ pb: 6 }}>
        {error && (
          <Alert severity='error' sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {packages.length === 0 && !loading ? (
          <Paper
            sx={{
              textAlign: 'center',
              py: 8,
              px: 4,
              background: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'grey.100',
                mx: 'auto',
                mb: 3,
              }}
            >
              <StarIcon sx={{ fontSize: 40, color: 'grey.400' }} />
            </Avatar>
            <Typography variant='h5' gutterBottom>
              Chưa có gói dịch vụ nào
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
              Hiện tại chưa có gói dịch vụ bảo trì nào được cung cấp.
            </Typography>
            <Button variant='contained' onClick={handleBackHome} size='large'>
              Về trang chủ
            </Button>
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 4,
            }}
          >
            {packages.map((pkg, index) => {
              const isPopular = index === 1; // Đặt gói giữa là popular

              return (
                <Card
                  key={pkg.id}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      borderRadius: 3,
                      overflow: 'visible',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isPopular ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: isPopular
                        ? '0 20px 40px rgba(25,118,210,0.2)'
                        : '0 8px 32px rgba(0,0,0,0.1)',
                      '&:hover': {
                        transform: isPopular ? 'scale(1.08)' : 'scale(1.03)',
                        boxShadow: isPopular
                          ? '0 25px 50px rgba(25,118,210,0.25)'
                          : '0 12px 40px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    {isPopular && (
                      <Chip
                        label='PHỔ BIẾN'
                        color='primary'
                        sx={{
                          position: 'absolute',
                          top: -12,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          zIndex: 1,
                          fontWeight: 'bold',
                          px: 2,
                        }}
                      />
                    )}

                    <CardContent
                      sx={{
                        flexGrow: 1,
                        p: 4,
                        textAlign: 'center',
                        background: isPopular
                          ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                          : 'white',
                        color: isPopular ? 'white' : 'inherit',
                      }}
                    >
                      {/* Package Icon */}
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: isPopular
                            ? 'rgba(255,255,255,0.2)'
                            : 'primary.light',
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        <StarIcon
                          sx={{
                            fontSize: 28,
                            color: isPopular ? 'white' : 'primary.main',
                          }}
                        />
                      </Avatar>

                      {/* Package Name */}
                      <Typography
                        variant='h4'
                        component='h3'
                        gutterBottom
                        fontWeight='bold'
                      >
                        {pkg.name}
                      </Typography>

                      {/* Price */}
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant='h3'
                          component='div'
                          fontWeight='bold'
                          color={isPopular ? 'white' : 'primary.main'}
                        >
                          {formatPrice(pkg.price)}
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{
                            opacity: isPopular ? 0.8 : 0.7,
                            mt: 1,
                          }}
                        >
                          cho {pkg.duration_months} tháng
                        </Typography>
                      </Box>

                      {/* Description */}
                      <Typography
                        variant='body1'
                        sx={{
                          mb: 3,
                          opacity: isPopular ? 0.9 : 0.8,
                          minHeight: 48,
                        }}
                      >
                        {pkg.description || 'Gói dịch vụ bảo trì chuyên nghiệp'}
                      </Typography>

                      {/* Features */}
                      <Box sx={{ mb: 4 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                          }}
                        >
                          <ScheduleIcon
                            sx={{
                              mr: 1,
                              fontSize: 20,
                              color: isPopular
                                ? 'rgba(255,255,255,0.8)'
                                : 'primary.main',
                            }}
                          />
                          <Typography
                            variant='body2'
                            sx={{ opacity: isPopular ? 0.9 : 0.8 }}
                          >
                            Thời gian: {pkg.duration_months} tháng
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                          }}
                        >
                          <CheckIcon
                            sx={{
                              mr: 1,
                              fontSize: 20,
                              color: isPopular
                                ? 'rgba(255,255,255,0.8)'
                                : 'success.main',
                            }}
                          />
                          <Typography
                            variant='body2'
                            sx={{ opacity: isPopular ? 0.9 : 0.8 }}
                          >
                            Bảo hành chất lượng
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CheckIcon
                            sx={{
                              mr: 1,
                              fontSize: 20,
                              color: isPopular
                                ? 'rgba(255,255,255,0.8)'
                                : 'success.main',
                            }}
                          />
                          <Typography
                            variant='body2'
                            sx={{ opacity: isPopular ? 0.9 : 0.8 }}
                          >
                            Hỗ trợ 24/7
                          </Typography>
                        </Box>
                      </Box>

                      {/* CTA Button */}
                      <Button
                        variant={isPopular ? 'outlined' : 'contained'}
                        size='large'
                        fullWidth
                        endIcon={<ArrowIcon />}
                        onClick={handleGetStarted}
                        sx={{
                          py: 1.5,
                          fontWeight: 'bold',
                          borderRadius: 2,
                          ...(isPopular && {
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.5)',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            '&:hover': {
                              borderColor: 'white',
                              backgroundColor: 'rgba(255,255,255,0.2)',
                            },
                          }),
                        }}
                      >
                        Chọn gói này
                      </Button>
                    </CardContent>
                  </Card>
              );
            })}
          </Box>
        )}

        {/* Call to Action Section */}
        {packages.length > 0 && (
          <Paper
            sx={{
              mt: 6,
              p: 6,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <Typography
              variant='h4'
              component='h2'
              gutterBottom
              fontWeight='bold'
            >
              Sẵn sàng bắt đầu?
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}
            >
              Đăng ký tài khoản ngay hôm nay để trải nghiệm dịch vụ bảo trì
              chuyên nghiệp
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant='contained'
                size='large'
                startIcon={<LoginIcon />}
                onClick={handleGetStarted}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                }}
              >
                Đăng ký ngay
              </Button>
              <Button
                variant='outlined'
                size='large'
                onClick={handleBackHome}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                }}
              >
                Tìm hiểu thêm
              </Button>
            </Box>
          </Paper>
        )}
      </Container>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default PackagesViewPage;
