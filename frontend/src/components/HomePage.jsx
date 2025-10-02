import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import {
  Schedule as ScheduleIcon,
  Devices as DevicesIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Engineering as EngineeringIcon,
  Support as SupportIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  MonetizationOn as MonetizationOnIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import bg from '../assets/bg.jpg';
import UniversalHeader from './layout/UniversalHeader';
import Footer from './layout/Footer';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openContact, setOpenContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleContactSubmit = () => {
    console.log('Contact form submitted:', contactForm);
    setOpenContact(false);
    setContactForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <Box>
      {/* Universal Header */}
      <UniversalHeader isPublic={true} />

      {/* Main Content with top padding for fixed header */}
      <Box sx={{ pt: 8 }}>
        {/* Hero Section */}
        <Box
          sx={{
            background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            color: 'white',
            py: { xs: 8, md: 12 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Container maxWidth='lg'>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 4,
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography
                  variant='h1'
                  component='h1'
                  sx={{
                    fontSize: isMobile ? '2.5rem' : '3.5rem',
                    fontWeight: 700,
                    mb: 3,
                    lineHeight: 1.2,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  Hệ thống quản lý bảo trì thiết bị
                  <Typography
                    component='span'
                    sx={{
                      color: '#22d3ee',
                      display: 'block',
                      fontSize: { xs: '2rem', md: '2.5rem' },
                    }}
                  >
                    chuyên nghiệp
                  </Typography>
                </Typography>
                <Typography
                  variant='h5'
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    fontWeight: 400,
                    lineHeight: 1.5,
                  }}
                >
                  Quản lý thiết bị gia dụng một cách thông minh với hệ thống đặt
                  lịch bảo trì tự động và theo dõi tiến độ chi tiết.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant='contained'
                    size='large'
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                    onClick={() => navigate('/register')}
                  >
                    Đăng ký ngay
                  </Button>
                  <Button
                    variant='outlined'
                    size='large'
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                    onClick={() => navigate('/login')}
                  >
                    Đăng nhập
                  </Button>
                </Box>
              </Box>
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {/* <Box
                    sx={{
                      width: { xs: 500, md: 600 },
                      height: { xs: 500, md: 400 },
                      bgcolor: 'rgba(255,255,255,0.1)',
                      background: `url(${banner})`,
                    }}
                  ></Box> */}
                </Box>
              </Box>
            </Box>
          </Container>

          {/* Floating Service Cards */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Container maxWidth='lg'>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                  gap: 2,
                  mt: 4,
                }}
              >
                {[
                  {
                    icon: <DevicesIcon />,
                    title: 'Quản lý thiết bị',
                    desc: 'Theo dõi tình trạng thiết bị',
                  },
                  {
                    icon: <ScheduleIcon />,
                    title: 'Đặt lịch bảo trì',
                    desc: 'Lập lịch tự động',
                  },
                  {
                    icon: <NotificationsIcon />,
                    title: 'Nhắc nhở',
                    desc: 'Thông báo kịp thời',
                  },
                  {
                    icon: <SupportIcon />,
                    title: 'Hỗ trợ 24/7',
                    desc: 'Luôn sẵn sàng hỗ trợ',
                  },
                ].map((service, index) => (
                  <Box key={index}>
                    <Card
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        height: '100%',

                        boxShadow: 3,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          transition: 'transform 0.3s ease',
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          mx: 'auto',
                          mb: 2,
                          width: 56,
                          height: 56,
                        }}
                      >
                        {service.icon}
                      </Avatar>
                      <Typography variant='h6' gutterBottom>
                        {service.title}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {service.desc}
                      </Typography>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Container>
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 10, mt: 8 }}>
          <Container maxWidth='lg'>
            <Typography
              variant='h2'
              component='h2'
              textAlign='center'
              gutterBottom
              sx={{ mb: 6 }}
            >
              Trải nghiệm dịch vụ chuyên nghiệp
            </Typography>
            <Typography
              variant='h6'
              textAlign='center'
              color='text.secondary'
              sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
            >
              Hệ thống Maintenance Pro mang đến cho bạn những tính năng hiện đại
              với giao diện thân thiện, giúp quản lý thiết bị gia dụng một cách
              hiệu quả và chuyên nghiệp.
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                gap: 4,
              }}
            >
              {[
                {
                  icon: <SpeedIcon sx={{ fontSize: 48 }} />,
                  title: 'Nhanh chóng',
                  desc: 'Hệ thống xử lý nhanh chóng, đặt lịch bảo trì chỉ trong vài phút',
                  color: 'primary.main',
                },
                {
                  icon: <SecurityIcon sx={{ fontSize: 48 }} />,
                  title: 'Bảo mật',
                  desc: 'Thông tin được mã hóa và bảo mật tuyệt đối theo tiêu chuẩn quốc tế',
                  color: 'success.main',
                },
                {
                  icon: <MonetizationOnIcon sx={{ fontSize: 48 }} />,
                  title: 'Tiết kiệm',
                  desc: 'Giảm chi phí bảo trì lên đến 30% nhờ lịch trình tối ưu',
                  color: 'warning.main',
                },
              ].map((feature, index) => (
                <Box key={index}>
                  <Card
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      '&:hover': {
                        borderColor: feature.color,
                        transform: 'translateY(-5px)',
                        transition: 'all 0.3s ease',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: feature.color,
                        mx: 'auto',
                        mb: 3,
                        width: 80,
                        height: 80,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant='h5' gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography color='text.secondary' sx={{ lineHeight: 1.6 }}>
                      {feature.desc}
                    </Typography>
                  </Card>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* Why Choose Us Section */}
        <Box sx={{ py: 10, bgcolor: 'grey.50' }}>
          <Container maxWidth='lg'>
            <Typography
              variant='h2'
              component='h2'
              textAlign='center'
              gutterBottom
              sx={{ mb: 8 }}
            >
              Tại sao nên chọn Maintenance Pro?
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 4,
              }}
            >
              <Box>
                <Box sx={{ pr: { md: 4 } }}>
                  <Typography variant='h4' gutterBottom sx={{ mb: 4 }}>
                    Giải pháp quản lý toàn diện
                  </Typography>
                  <List sx={{ mb: 4 }}>
                    {[
                      'Quản lý thiết bị tập trung',
                      'Lập lịch bảo trì tự động',
                      'Thông báo nhắc nhở thông minh',
                      'Báo cáo chi tiết và phân tích',
                      'Hỗ trợ đa nền tảng',
                    ].map((item, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircleIcon color='primary' />
                        </ListItemIcon>
                        <ListItemText
                          primary={item}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '1.1rem',
                              fontWeight: 500,
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
              <Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 3,
                  }}
                >
                  {[
                    {
                      title: 'Đúng giờ',
                      desc: 'Nhắc nhở và thông báo bảo trì đúng thời gian đã lên lịch',
                      icon: <ScheduleIcon />,
                    },
                    {
                      title: 'Đúng việc',
                      desc: 'Hướng dẫn chi tiết từng bước bảo trì cho từng loại thiết bị',
                      icon: <EngineeringIcon />,
                    },
                    {
                      title: 'Đúng giá',
                      desc: 'Tính toán chi phí minh bạch, không phát sinh thêm',
                      icon: <MonetizationOnIcon />,
                    },
                  ].map((benefit, index) => (
                    <Box key={index}>
                      <Card
                        sx={{ p: 3, display: 'flex', alignItems: 'flex-start' }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            mr: 2,
                            mt: 0.5,
                          }}
                        >
                          {benefit.icon}
                        </Avatar>
                        <Box>
                          <Typography variant='h6' gutterBottom>
                            {benefit.title}
                          </Typography>
                          <Typography color='text.secondary'>
                            {benefit.desc}
                          </Typography>
                        </Box>
                      </Card>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Testimonials Section */}
        <Box sx={{ py: 10 }}>
          <Container maxWidth='lg'>
            <Typography
              variant='h2'
              component='h2'
              textAlign='center'
              gutterBottom
              sx={{ mb: 8 }}
            >
              Khách hàng nói gì về chúng tôi
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                gap: 4,
              }}
            >
              {[
                {
                  name: 'Chị Nguyễn Thị Mai',
                  location: 'Cầu Giấy, Hà Nội',
                  content:
                    'Tôi rất hài lòng với hệ thống Maintenance Pro. Việc quản lý các thiết bị gia đình trở nên dễ dàng hơn rất nhiều. Tính năng nhắc nhở bảo trì rất hữu ích.',
                  rating: 5,
                },
                {
                  name: 'Anh Trần Văn Nam',
                  location: 'Thanh Xuân, Hà Nội',
                  content:
                    'Giao diện thân thiện, dễ sử dụng. Tôi có thể theo dõi tình trạng tất cả thiết bị trong nhà chỉ với một ứng dụng. Rất tiện lợi!',
                  rating: 5,
                },
                {
                  name: 'Chị Phạm Thị Lan',
                  location: 'Ba Đình, Hà Nội',
                  content:
                    'Hệ thống giúp tôi tiết kiệm được rất nhiều thời gian và chi phí bảo trì. Các thông báo rất chính xác và hữu ích.',
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <Box key={index}>
                  <Card
                    sx={{
                      p: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} sx={{ color: 'warning.main' }} />
                      ))}
                    </Box>
                    <Typography
                      sx={{
                        mb: 3,
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                        flexGrow: 1,
                      }}
                    >
                      "{testimonial.content}"
                    </Typography>
                    <Box>
                      <Typography variant='subtitle1' fontWeight='bold'>
                        {testimonial.name}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {testimonial.location}
                      </Typography>
                    </Box>
                  </Card>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            py: 10,
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            color: 'white',
          }}
        >
          <Container maxWidth='md'>
            <Box textAlign='center'>
              <Typography
                variant='h3'
                component='h2'
                gutterBottom
                sx={{ mb: 4 }}
              >
                Bắt đầu quản lý thiết bị thông minh ngay hôm nay
              </Typography>
              <Typography variant='h6' sx={{ mb: 6, opacity: 0.9 }}>
                Đăng ký tài khoản miễn phí và trải nghiệm tất cả tính năng của
                Maintenance Pro
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 3,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant='contained'
                  size='large'
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 6,
                    py: 2,
                    fontSize: '1.2rem',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                  onClick={() => navigate('/register')}
                >
                  Đăng ký miễn phí
                </Button>

                <Button
                  variant='outlined'
                  size='large'
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 6,
                    py: 2,
                    fontSize: '1.2rem',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                  onClick={() => setOpenContact(true)}
                >
                  Liên hệ tư vấn
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
        {/* FAQ Section */}
        <Box sx={{ py: 10, bgcolor: 'background.default' }}>
          <Container maxWidth='md'>
            <Box textAlign='center' mb={6}>
              <Typography
                variant='h2'
                component='h2'
                gutterBottom
                fontWeight='bold'
              >
                Câu Hỏi Thường Gặp
              </Typography>
              <Typography variant='h6' color='text.secondary'>
                Những câu hỏi phổ biến về hệ thống Maintenance Pro
              </Typography>
            </Box>

            {[
              {
                question: 'Hệ thống Maintenance Pro hoạt động như thế nào?',
                answer:
                  'Maintenance Pro giúp bạn quản lý tất cả thiết bị gia dụng trong một hệ thống tập trung. Bạn có thể theo dõi tình trạng, đặt lịch bảo trì tự động và nhận thông báo nhắc nhở kịp thời.',
              },
              {
                question: 'Tôi có thể quản lý được bao nhiều thiết bị?',
                answer:
                  'Hệ thống không giới hạn số lượng thiết bị bạn có thể thêm vào. Bạn có thể quản lý từ các thiết bị nhỏ như quạt điện đến các thiết bị lớn như điều hòa, tủ lạnh.',
              },
              {
                question: 'Làm thế nào để đặt lịch bảo trì tự động?',
                answer:
                  'Sau khi thêm thiết bị, bạn có thể cài đặt chu kỳ bảo trì (hằng tháng, quý, năm). Hệ thống sẽ tự động tạo lịch và gửi thông báo nhắc nhở trước thời hạn.',
              },
              {
                question: 'Có hỗ trợ kỹ thuật không?',
                answer:
                  'Chúng tôi có đội ngũ hỗ trợ kỹ thuật 24/7 qua email và hotline. Bạn cũng có thể tìm thấy hướng dẫn chi tiết trong phần tài liệu hệ thống.',
              },
            ].map((faq, index) => (
              <Accordion key={index} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='h6' fontWeight='medium'>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color='text.secondary' sx={{ lineHeight: 1.7 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Container>
        </Box>

        {/* Footer */}
        <Footer />

        {/* Contact Dialog */}
        <Dialog
          open={openContact}
          onClose={() => setOpenContact(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Liên Hệ Tư Vấn</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label='Họ và tên'
                value={contactForm.name}
                onChange={(e) =>
                  setContactForm({ ...contactForm, name: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label='Email'
                type='email'
                value={contactForm.email}
                onChange={(e) =>
                  setContactForm({ ...contactForm, email: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label='Số điện thoại'
                value={contactForm.phone}
                onChange={(e) =>
                  setContactForm({ ...contactForm, phone: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label='Nội dung'
                multiline
                rows={4}
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm({ ...contactForm, message: e.target.value })
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenContact(false)}>Hủy</Button>
            <Button variant='contained' onClick={handleContactSubmit}>
              Gửi liên hệ
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default HomePage;
