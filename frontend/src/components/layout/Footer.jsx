import React from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Link,
} from '@mui/material';
import {
  Build as BuildIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 8 }}>
      <Container maxWidth='lg'>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 2fr' },
            gap: 4,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  mr: 2,
                  width: 48,
                  height: 48,
                }}
              >
                <BuildIcon sx={{ fontSize: 24 }} />
              </Avatar>
              <Typography variant='h5' fontWeight='bold'>
                Maintenance Pro
              </Typography>
            </Box>
            <Typography sx={{ mb: 3, opacity: 0.8, lineHeight: 1.6 }}>
              Hệ thống quản lý bảo trì thiết bị gia dụng chuyên nghiệp, giúp bạn
              theo dõi và bảo trì thiết bị một cách hiệu quả.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.dark' },
                  transition: 'all 0.2s',
                }}
              >
                <FacebookIcon />
              </Avatar>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.dark' },
                  transition: 'all 0.2s',
                }}
              >
                <TwitterIcon />
              </Avatar>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.dark' },
                  transition: 'all 0.2s',
                }}
              >
                <LinkedInIcon />
              </Avatar>
            </Box>
          </Box>

          <Box>
            <Typography variant='h6' gutterBottom>
              Dịch vụ
            </Typography>
            <List sx={{ p: 0 }}>
              {[
                'Quản lý thiết bị',
                'Lập lịch bảo trì',
                'Thông báo nhắc nhở',
                'Báo cáo',
              ].map((item) => (
                <ListItem key={item} sx={{ px: 0, py: 0.5 }}>
                  <Link
                    href='#'
                    color='inherit'
                    underline='hover'
                    sx={{
                      opacity: 0.8,
                      '&:hover': { opacity: 1 },
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {item}
                  </Link>
                </ListItem>
              ))}
            </List>
          </Box>

          <Box>
            <Typography variant='h6' gutterBottom>
              Hỗ trợ
            </Typography>
            <List sx={{ p: 0 }}>
              {[
                'Hướng dẫn sử dụng',
                'Câu hỏi thường gặp',
                'Liên hệ hỗ trợ',
                'Chính sách',
              ].map((item) => (
                <ListItem key={item} sx={{ px: 0, py: 0.5 }}>
                  <Link
                    href='#'
                    color='inherit'
                    underline='hover'
                    sx={{
                      opacity: 0.8,
                      '&:hover': { opacity: 1 },
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {item}
                  </Link>
                </ListItem>
              ))}
            </List>
          </Box>

          <Box>
            <Typography variant='h6' gutterBottom>
              Liên hệ
            </Typography>
            <List sx={{ p: 0 }}>
              <ListItem sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                <ListItemIcon
                  sx={{ minWidth: 36, color: 'primary.main', mt: 0.5 }}
                >
                  <LocationOnIcon />
                </ListItemIcon>
                <ListItemText
                  primary='Số 123 Đường ABC, Quận XYZ, Hà Nội'
                  sx={{ '& .MuiListItemText-primary': { opacity: 0.8 } }}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText
                  primary='1900 123 456'
                  sx={{ '& .MuiListItemText-primary': { opacity: 0.8 } }}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary='support@maintenancepro.com'
                  sx={{ '& .MuiListItemText-primary': { opacity: 0.8 } }}
                />
              </ListItem>
            </List>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'grey.700' }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Typography sx={{ opacity: 0.8 }}>
            © 2025 Maintenance Pro. Tất cả quyền được bảo lưu.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, mt: { xs: 2, md: 0 } }}>
            <Link
              href='#'
              color='inherit'
              underline='hover'
              sx={{
                opacity: 0.8,
                '&:hover': { opacity: 1 },
                transition: 'opacity 0.2s',
              }}
            >
              Điều khoản sử dụng
            </Link>
            <Link
              href='#'
              color='inherit'
              underline='hover'
              sx={{
                opacity: 0.8,
                '&:hover': { opacity: 1 },
                transition: 'opacity 0.2s',
              }}
            >
              Chính sách bảo mật
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
